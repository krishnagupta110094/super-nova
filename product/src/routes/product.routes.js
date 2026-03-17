const express = require("express");
const createAuthMiddleware = require("../middlewares/auth.middleware");
const upload = require("../config/multer.config");
const {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getProductBySeller,
} = require("../controllers/product.controller");
const {
  createProductValidators,
} = require("../middlewares/validator.middleware");
const multerErrorHandler = require("../middlewares/multerError.middleware");

const router = express.Router();

/**
 * @route POST /api/products
 * @desc Create a new product
 * @access Private
 *
 */
router.post(
  "/",
  createAuthMiddleware(["admin", "seller"]),
  upload.array("images", 5),
  createProductValidators,
  createProduct,
  multerErrorHandler,
);

/**
 * @route GET /api/products
 * @desc Get all products
 * @access Public
 */
router.get("/", getAllProducts);

/**
 * @route PATCH /api/products/:id
 * @desc Update a product by ID
 * @access Private
 */
router.patch("/:id", createAuthMiddleware(["seller"]), updateProduct);

/**
 * @route DELETE /api/products/:id
 * @desc Delete a product by ID
 * @access Private
 */
router.delete("/:id", createAuthMiddleware(["seller"]), deleteProduct);

/**
 * @route GET /api/products/seller
 * @desc Get all products by seller
 * @access Private
 */
router.get(
  "/seller",
  createAuthMiddleware(["admin", "seller"]),
  getProductBySeller,
);

/**
 * @route GET /api/products/:id
 * @desc Get a product by ID
 * @access Public
 */
router.get("/:id", getProductById);
module.exports = router;
