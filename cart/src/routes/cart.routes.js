const express = require("express");
const createAuthMiddleware = require("../middlewares/auth.middleware");
const {
  addItemToCart,
  updateItemQuantity,
  getCart,
  deleteItemFromCart,
  clearCart,
} = require("../controllers/cart.controller");
const {
  validateAddItemToCart,
  validateUpdateItemToCart,
} = require("../middlewares/validation.middleware");
const router = express.Router();

/**
 * @route GET /api/cart
 * @description Get cart of user
 * @access Private
 */
router.get("/", createAuthMiddleware(["user"]), getCart);

/**
 * @route POST /api/cart/items
 * @description Add item to cart
 * @access Private
 *
 */
router.post(
  "/items",
  validateAddItemToCart,
  createAuthMiddleware(["user"]),
  addItemToCart,
);

/**
 * @route PATCH /api/cart/items/:productId
 * @description Update item quantity in cart
 * @access Private
 */
router.patch(
  "/items/:productId",
  validateUpdateItemToCart,
  createAuthMiddleware(["user"]),
  updateItemQuantity,
);

/**
 * @route DELETE /api/cart
 * @description Clear cart
 * @access Private
 */
router.delete("/", createAuthMiddleware(["user"]), clearCart);

/**
 * @route DELETE /api/cart/items/:productId
 * @description Remove item from cart
 * @access Private
 */
router.delete(
  "/items/:productId",
  createAuthMiddleware(["user"]),
  deleteItemFromCart,
);

module.exports = router;
