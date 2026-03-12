const { body, validationResult } = require("express-validator");

const respondWithValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

const registerUserValidations = [
  body("username")
    .isString()
    .withMessage("Username must be a string")
    .isLength({ min: 3, max: 20 })
    .withMessage("Username must be between 3 and 20 characters long"),
  body("email").isEmail().withMessage("Invalid email address"),
  body("password")
    .isString()
    .withMessage("Password must be a string")
    .isLength({ min: 6, max: 20 })
    .withMessage("Password must be between 6 and 20 characters long"),
  body("fullName.firstName")
    .isString()
    .withMessage("First name must be a string")
    .trim()
    .notEmpty()
    .withMessage("First name is required")
    .isLength({ min: 3, max: 20 })
    .withMessage("First name must be between 3 and 20 characters long"),
  body("fullName.lastName")
    .isString()
    .withMessage("Last name must be a string")
    .trim()
    .notEmpty()
    .withMessage("Last name is required")
    .isLength({ min: 3, max: 20 })
    .withMessage("Last name must be between 3 and 20 characters long"),
  body("role")
    .optional()
    .isIn("user", "seller")
    .withMessage("Role must be either user or seller"),
  respondWithValidationErrors,
];

const loginUserValidations = [
  body("email").optional().isEmail().withMessage("Invalid email address"),

  body("username")
    .optional()
    .isString()
    .withMessage("Username must be a string")
    .trim()
    .notEmpty()
    .withMessage("Username cannot be empty"),

  body("password")
    .isString()
    .withMessage("Password must be a string")
    .isLength({ min: 6, max: 20 })
    .withMessage("Password must be between 6 and 20 characters long"),

  body().custom((value) => {
    if (!value.email && !value.username) {
      throw new Error("Email or username is required");
    }
    return true;
  }),

  respondWithValidationErrors,
];

const addUserAddressValidations = [
  body("street")
    .trim()
    .notEmpty()
    .withMessage("Street is required")
    .isString()
    .withMessage("Street must be a string"),

  body("city")
    .trim()
    .notEmpty()
    .withMessage("City is required")
    .isString()
    .withMessage("City must be a string"),

  body("state")
    .trim()
    .notEmpty()
    .withMessage("State is required")
    .isString()
    .withMessage("State must be a string"),

  body("country")
    .trim()
    .notEmpty()
    .withMessage("Country is required")
    .isString()
    .withMessage("Country must be a string"),

  body("pincode")
    .notEmpty()
    .withMessage("pincode is required")
    .isInt()
    .withMessage("pincode must be a number"),

  body("isDefault")
    .optional()
    .isBoolean()
    .withMessage("isDefault must be a boolean"),
];

module.exports = {
  registerUserValidations,
  loginUserValidations,
  addUserAddressValidations,
};
