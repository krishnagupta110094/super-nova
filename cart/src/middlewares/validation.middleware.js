const { body, validationResult, param } = require("express-validator");
const mongoose = require("mongoose");

const validateResult = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

const validateAddItemToCart = [
  body("productId")
    .isString()
    .withMessage("Product Id must be a string...")
    .custom((productId) => mongoose.Types.ObjectId.isValid(productId))
    .withMessage("Invalid Product ID Format..."),
  body("qty")
    .isInt({ gt: 0 })
    .withMessage("Quantity must be greater than 0..."),
  validateResult,
];

const validateUpdateItemToCart = [
  param("productId")
    .custom((productId) => mongoose.Types.ObjectId.isValid(productId))
    .withMessage("Invalid Product ID Format..."),
  body("qty")
    .isInt({ gt: 0 })
    .withMessage("Quantity must be greater than 0..."),
  validateResult,
];

module.exports = { validateAddItemToCart, validateUpdateItemToCart };
