const { body, validationResult } = require("express-validator");

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      errors: errors.array(),
    });
  }

  next();
};

const createProductValidators = [
  body("title").isString().trim().notEmpty().withMessage("Title is required"),

  body("description")
    .optional()
    .isString()
    .withMessage("Description must be a string")
    .trim()
    .isLength({ min: 0, max: 500 })
    .withMessage("Description must be between 0 and 500 characters long"),

  body("priceAmount")
    .notEmpty()
    .withMessage("Price amount is required")
    .bail()
    .isFloat({ gt: 0 })
    .withMessage("Price must be a number"),

  body("priceCurrency")
    .optional()
    .isIn(["USD", "INR"])
    .withMessage("Price currency must be USD or INR"),
  handleValidationErrors,
];

module.exports = {
  createProductValidators,
};
