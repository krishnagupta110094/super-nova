const { subscribeToQueue } = require("./broker");
const UserModel = require("../models/user.model");
const ProductModel = require("../models/product.model");
const OrderModel = require("../models/order.model");
const PaymentModel = require("../models/payment.model");

module.exports = function () {
  subscribeToQueue("AUTH_SELLER_DASHBOARD.USER_CREATED", async (user) => {
    await UserModel.create(user);
  });

  subscribeToQueue(
    "PRODUCT_SELLER_DASHBOARD.PRODUCT_CREATED",
    async (product) => {
      await ProductModel.create(product);
    },
  );

  subscribeToQueue("ORDER_SELLER_DASHBOARD.ORDER_CREATED", async (order) => {
    await OrderModel.create(order);
  });

  subscribeToQueue(
    "PAYMENT_SELLER_DASHBOARD.PAYMENT_CREATED",
    async (payment) => {
      await PaymentModel.create(payment);
    },
  );

  subscribeToQueue(
    "PAYMENT_SELLER_DASHBOARD.PAYMENT_UPDATED",
    async (payment) => {
      await PaymentModel.findOneAndUpdate(
        { order: payment.order },
        { status: payment.status },
      );
    },
  );
};
