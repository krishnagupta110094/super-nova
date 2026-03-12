const UserModel = require("../models/user.model");
const jwt = require("jsonwebtoken");
const redis = require("../db/redis");

/**
 * @function authMiddleware
 * @description Middleware to authenticate a user using a JWT stored in cookies
 * and validate that the token is not blacklisted in Redis.
 *
 * Workflow:
 * 1. Read JWT token from `req.cookies.token`.
 * 2. Check if the token exists in Redis blacklist.
 * 3. If blacklisted → return 401 Unauthorized.
 * 4. Verify the JWT using `JWT_SECRET`.
 * 5. Decode payload to get the user ID.
 * 6. Fetch the user from the database.
 * 7. Attach the user document to `req.user`.
 * 8. Proceed to the next middleware.
 *
 * If the token is missing, invalid, blacklisted, or the user does not exist,
 * a `401 Unauthorized` response is returned.
 *
 * @route Used in protected routes
 * @access Private
 *
 * @returns {Promise<void>} Calls next middleware if authentication succeeds
 *
 * @throws {401} If token is missing, invalid, blacklisted, or user not found
 */
exports.authMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    // 🔴 Check Redis blacklist
    const isBlacklisted = await redis.get(`blacklist:${token}`);

    if (isBlacklisted) {
      return res.status(401).json({
        message: "Token has been logged out",
      });
    }

    // Verify JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user
    const user = await UserModel.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({
        message: "User not found",
      });
    }

    // Attach user to request
    req.user = user;

    next();
  } catch (error) {
    console.error("Auth middleware error:", error);

    return res.status(401).json({
      message: "Unauthorized",
    });
  }
};
