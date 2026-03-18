const jwt = require("jsonwebtoken");

function createAuthMiddleware(roles = ["user"]) {
  return function authMiddleware(req, res, next) {
    const token =
      req.cookies?.token || req.headers.authorization?.split(" ")[1];
    console.log(token, "token");
    if (!token) {
      return res
        .status(401)
        .json({ message: "Unauthorized: No Token Provided..." });
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      //   console.log("decoded", decoded);
      if (!roles.includes(decoded.role)) {
        return res
          .status(401)
          .json({ message: "Unauthorized: Invalid Role..." });
      }
      req.user = decoded;
      next();
    } catch (error) {
      return res
        .status(401)
        .json({ message: "Unauthorized: Invalid Token..." });
    }
  };
}

module.exports = createAuthMiddleware;
