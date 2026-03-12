const UserModel = require("../models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const redis = require("../db/redis");

/**
 * @function registerUser
 * @description Registers a new user in the system.
 *
 * This controller performs the following steps:
 * 1. Extracts user data from the request body.
 * 2. Checks if a user with the same username or email already exists.
 * 3. Hashes the user's password using bcrypt.
 * 4. Creates a new user document in the database.
 * 5. Generates a JWT token for authentication.
 * 6. Sets the token in an HTTP-only cookie.
 * 7. Returns the created user information in the response.
 *
 * @route POST /auth/register
 * @access Public
 *
 * @returns {Promise<void>} Sends JSON response with created user data and authentication cookie
 *
 * @throws {409} If username or email already exists
 * @throws {500} If an internal server error occurs
 */
exports.registerUser = async (req, res) => {
  try {
    const { username, email, password, fullName, addresses, role } = req.body;

    const firstName = fullName?.firstName;
    const lastName = fullName?.lastName;

    // check user exists
    const isUserAlreadyExists = await UserModel.findOne({
      $or: [{ username }, { email }],
    });

    if (isUserAlreadyExists) {
      return res.status(409).json({
        message: "Username or email already exists",
      });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // create user
    const user = await UserModel.create({
      username,
      email,
      password: hashedPassword,
      fullName: {
        firstName,
        lastName,
      },
      role: role || "user",
      addresses: addresses || [],
    });

    // generate token
    const token = jwt.sign(
      {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      },
    );

    // set cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        fullName: {
          firstName: user.fullName.firstName,
          lastName: user.fullName.lastName,
        },
        role: user.role,
        addresses: user.addresses,
      },
    });
  } catch (error) {
    console.error("Register error:", error);

    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

/**
 * @function loginUser
 * @description Logs in a user in the system.
 *
 * This controller performs the following steps:
 * 1. Extracts user data from the request body.
 * 2. Checks if a user with the provided username or email exists.
 * 3. Compares the provided password with the stored hashed password.
 * 4. Generates a JWT token for authentication.
 * 5. Sets the token in an HTTP-only cookie.
 * 6. Returns the logged-in user information in the response.
 *
 * @route POST /auth/login
 * @access Public
 *
 * @returns {Promise<void>} Sends JSON response with logged-in user data and authentication cookie
 *
 * @throws {401} If invalid email or password
 * @throws {500} If an internal server error occurs
 */
exports.loginUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // find user (password select karna padega)
    const user = await UserModel.findOne({
      $or: [{ username }, { email }],
    }).select("+password");

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // compare password
    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // generate token
    const token = jwt.sign(
      {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );

    // set cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      message: "User logged in successfully",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        addresses: user.addresses,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

/**
 * @function getCurrentUser
 * @description Retrieves the current user's information.
 *
 * @route GET /auth/me
 * @access Private
 *
 * @returns {Promise<void>} Sends JSON response with current user data
 */
exports.getCurrentUser = async (req, res) => {
  return res.status(200).json({
    message: "Current User Fetched Successfully",
    user: req.user,
  });
};

/**
 * @function logoutUser
 * @description Logs out a user from the system.
 *
 * This controller performs the following steps:
 * 1. Reads the JWT token from the request cookies.
 * 2. Sets the token in the Redis blacklist for 24 hours.
 * 3. Clears the token cookie.
 * 4. Returns a success message in the response.
 *
 * @route POST /auth/logout
 * @access Private
 *
 * @returns {Promise<void>} Sends JSON response indicating successful logout
 */
exports.logoutUser = async (req, res) => {
  const token = req.cookies.token;
  if (token) {
    await redis.set(`blacklist:${token}`, "true", "EX", 60 * 60 * 24); //expires in 24 hours
  }
  res.clearCookie("token", {
    httpOnly: true,
    secure: true,
  });
  return res.status(200).json({
    message: "User logged out successfully",
  });
};

/**
 * @function getUserAddresses
 * @description Retrieves the addresses associated with a user.
 *
 * This controller performs the following steps:
 * 1. Extracts the user ID from the request user object.
 * 2. Fetches the user document from the database.
 * 3. Returns the user addresses in the response.
 *
 * @route GET /auth/addresses
 * @access Private
 *
 * @returns {Promise<void>} Sends JSON response with user addresses
 */
exports.getUserAddresses = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await UserModel.findById(userId).select("addresses");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json({
      message: "User addresses fetched successfully",
      addresses: user.addresses,
    });
  } catch (error) {
    console.error("Error fetching user addresses:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

/**
 * @function addUserAddress
 * @description Adds a new address to the user's address list.
 *
 * This controller performs the following steps:
 * 1. Extracts the user ID from the request user object.
 * 2. Fetches the user document from the database.
 * 3. Adds the new address to the user's address list.
 * 4. Returns the new address in the response.
 *
 * @route POST /auth/addresses
 * @access Private
 *
 * @returns {Promise<void>} Sends JSON response with new address
 */
exports.addUserAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { street, city, state, country, pincode, isDefault } = req.body;

    const user = await UserModel.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // If new address is default → remove previous defaults
    if (isDefault) {
      user.addresses.forEach((addr) => {
        addr.isDefault = false;
      });
    }

    const newAddress = {
      street,
      city,
      state,
      country,
      pincode,
      isDefault: isDefault || false,
    };

    user.addresses.push(newAddress);

    await user.save();

    return res.status(201).json({
      message: "User address added successfully",
      address: user.addresses[user.addresses.length - 1],
    });
  } catch (error) {
    console.error("Error adding user address:", error);

    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

/**
 * @function deleteUserAddress
 * @description Deletes an address from the user's address list.
 *
 * This controller performs the following steps:
 * 1. Extracts the user ID and address ID from the request parameters.
 * 2. Fetches the user document from the database.
 * 3. Checks if the address exists in the user's address list.
 * 4. Deletes the address from the user's address list.
 * 5. Returns the updated address list in the response.
 *
 * @route DELETE /auth/addresses/:addressId
 * @access Private
 *
 * @returns {Promise<void>} Sends JSON response with updated address list
 */
exports.deleteUserAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { addressId } = req.params;

    const user = await UserModel.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const addressExists = user.addresses.some(
      (addr) => addr._id.toString() === addressId,
    );

    if (!addressExists) {
      return res.status(404).json({
        message: "Address not found",
      });
    }

    // delete address
    user.addresses = user.addresses.filter(
      (addr) => addr._id.toString() !== addressId,
    );

    await user.save();

    return res.status(200).json({
      message: "User address deleted successfully",
      addresses: user.addresses,
    });
  } catch (error) {
    console.error("Delete address error:", error);

    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};
