const { body, validationResult } = require("express-validator");

const respondWithValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

const createOrderValidation = [
  body("shippingAddress.street")
    .trim()
    .notEmpty()
    .withMessage("Street is required")
    .isString()
    .withMessage("Street must be a string"),

  body("shippingAddress.city")
    .trim()
    .notEmpty()
    .withMessage("City is required")
    .isString()
    .withMessage("City must be a string"),

  body("shippingAddress.state")
    .trim()
    .notEmpty()
    .withMessage("State is required")
    .isString()
    .withMessage("State must be a string"),

  body("shippingAddress.country")
    .trim()
    .notEmpty()
    .withMessage("Country is required")
    .isString()
    .withMessage("Country must be a string"),

  body("shippingAddress.pincode")
    .notEmpty()
    .withMessage("pincode is required")
    .isInt()
    .withMessage("pincode must be a number"),

  respondWithValidationErrors,
];

const updateAddressValidation = [
  body("shippingAddress.street")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Street is required")
    .isString()
    .withMessage("Street must be a string"),

  body("shippingAddress.city")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("City is required")
    .isString()
    .withMessage("City must be a string"),

  body("shippingAddress.state")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("State is required")
    .isString()
    .withMessage("State must be a string"),

  body("shippingAddress.country")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Country is required")
    .isString()
    .withMessage("Country must be a string"),

  body("shippingAddress.pincode")
    .optional()
    .notEmpty()
    .withMessage("pincode is required")
    .isInt()
    .withMessage("pincode must be a number"),

  respondWithValidationErrors,
];

module.exports = { createOrderValidation, updateAddressValidation };
