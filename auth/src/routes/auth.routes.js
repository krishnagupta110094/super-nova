const express = require("express");
const {
  registerUserValidations,
  loginUserValidations,
  addUserAddressValidations,
} = require("../middlewares/validator.middleware");
const {
  registerUser,
  loginUser,
  getCurrentUser,
  logoutUser,
  getUserAddresses,
  addUserAddress,
  deleteUserAddress,
} = require("../controllers/auth.controller");
const { authMiddleware } = require("../middlewares/auth.middleware");
const router = express.Router();

/** 
 * API Endpoints
 * 
 * 1. POST /api/auth/register - Register a new user
 * 2. POST /api/auth/login - Login a user
 * 3. GET /api/auth/me - Get current user
 * 4. POST /api/auth/logout - Logout a user
 * 5. GET /api/auth/users/me/addresses - Get user addresses
 * 6. POST /api/auth/users/me/address - Add user address
 * 7. DELETE /api/auth/users/me/addresses/:addressId - Delete user address
 * 
 */


/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post("/register", registerUserValidations, registerUser);

/**
 * @route   POST /api/auth/login
 * @desc    Login a user
 * @access  Public
 */
router.post("/login", loginUserValidations, loginUser);

/**
 * @route GET /api/auth/me
 * @desc Get current user
 * @access Private
 */
router.get("/me", authMiddleware, getCurrentUser);

/**
 * @route POST /api/auth/logout
 * @desc Logout a user
 * @access Private
 */
router.get("/logout", authMiddleware, logoutUser);

/**
 * @route GET /api/auth/users/me/addresses
 * @desc Get user addresses
 * @access Private
 */
router.get("/users/me/addresses", authMiddleware, getUserAddresses);

/**
 * @route POST /api/auth/users/me/address
 * @desc Add user address
 * @access Private
 */
router.post("/users/me/address",addUserAddressValidations, authMiddleware, addUserAddress);

/**
 * @route DELETE /api/auth/users/me/addresses/:addressId
 * @desc Delete user address
 * @access Private
 */
router.delete("/users/me/addresses/:addressId", authMiddleware, deleteUserAddress);

module.exports = router;
