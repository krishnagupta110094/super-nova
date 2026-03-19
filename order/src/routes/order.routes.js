const express = require("express");
const createAuthMiddleware = require("../middlewares/auth.middleware");
const {
  createOrder,
  getMyOrders,
  getOrderByID,
  cancelOrderByID,
  updateOrderAddress,
} = require("../controllers/order.controller");
const {
  createOrderValidation,
  updateAddressValidation,
} = require("../middlewares/validation.middleware");
const router = express.Router();

router.post(
  "/",
  createAuthMiddleware(["user"]),
  createOrderValidation,
  createOrder,
);
router.get("/me", createAuthMiddleware(["user"]), getMyOrders);

router.get("/:id", createAuthMiddleware(["user"]), getOrderByID);

router.get("/:id/cancel", createAuthMiddleware(["user"]), cancelOrderByID);

router.patch(
  "/:id/address",
  createAuthMiddleware(["user"]),
  updateAddressValidation,
  updateOrderAddress,
);

module.exports = router;
