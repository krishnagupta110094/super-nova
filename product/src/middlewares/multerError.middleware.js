const multer = require("multer");

const multerErrorHandler = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_UNEXPECTED_FILE") {
      return res.status(400).json({
        message: "Maximum 5 images allowed",
      });
    }

    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        message: "File size too large",
      });
    }

    return res.status(400).json({
      message: err.message,
    });
  }

  next(err);
};

module.exports = multerErrorHandler;
