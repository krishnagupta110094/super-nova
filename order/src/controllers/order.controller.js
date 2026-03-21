const axios = require("axios");
const OrderModel = require("../models/order.model");
const { publishToQueue } = require("../broker/broker");

exports.createOrder = async (req, res) => {
  try {
    const token =
      req.cookies?.token ||
      (req.headers.authorization && req.headers.authorization.split(" ")[1]);

    if (!token) {
      return res.status(401).json({ message: "Token not provided" });
    }

    // ✅ Fetch Cart
    const cartResponse = await axios.get("http://localhost:3002/api/cart/", {
      headers: { Authorization: `Bearer ${token}` },
    });

    const cart = cartResponse.data?.cart;

    if (!cart || !cart.items || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // ✅ Validate Shipping Address
    if (!req.body.shippingAddress) {
      return res.status(400).json({ message: "Shipping address required" });
    }

    // ✅ Fetch Products Safely
    const products = await Promise.all(
      cart.items.map(async (item) => {
        try {
          const res = await axios.get(
            `http://localhost:3001/api/products/${item.productId}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            },
          );
          return res.data.product;
        } catch (err) {
          return null; // handle missing product
        }
      }),
    );

    let finalTotalPrice = 0;
    const orderItems = [];

    for (const item of cart.items) {
      // ✅ Quantity validation
      if (!item.quantity || item.quantity <= 0) {
        return res.status(400).json({
          message: `Invalid quantity for product ${item.productId}`,
        });
      }

      const product = products.find(
        (p) => p && p._id.toString() === item.productId.toString(),
      );

      // ✅ Product not found
      if (!product) {
        return res.status(404).json({
          message: `Product not found: ${item.productId}`,
        });
      }

      // ✅ Price validation
      if (!product.price || !product.price.amount) {
        return res.status(400).json({
          message: `Invalid price for product ${product.title}`,
        });
      }

      // ✅ Stock validation
      if (!product.stock || product.stock < item.quantity) {
        return res.status(400).json({
          message: `Product ${product.title} is out of stock`,
        });
      }

      const itemTotal = product.price.amount * item.quantity;
      finalTotalPrice += itemTotal;

      orderItems.push({
        product: item.productId,
        quantity: item.quantity,
        price: {
          amount: itemTotal,
          currency: product.price.currency || "INR",
        },
      });
    }

    // ✅ Create Order
    const order = await OrderModel.create({
      user: req.user.id,
      items: orderItems,
      status: "PENDING",
      totalPrice: {
        amount: finalTotalPrice,
        currency: "INR",
      },
      shippingAddress: req.body.shippingAddress,
    });

    await publishToQueue("ORDER_SELLER_DASHBOARD.ORDER_CREATED", order);
    // ============================
    // 🔥 1. STOCK DEDUCTION
    // ============================

    // ============================
    // 🧹 2. CLEAR CART
    // ============================
    try {
      await axios.delete("http://localhost:3002/api/cart", {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (err) {
      console.error("Cart clear failed:", err.message);
      // not failing order because it's non-critical
    }

    return res.status(201).json({
      message: "Order created successfully",
      order,
    });
  } catch (error) {
    console.error("Order Error:", error.message);

    // ✅ Axios error handling
    if (error.response) {
      return res.status(error.response.status).json({
        message: error.response.data?.message || "External service error",
      });
    }

    return res.status(500).json({
      message: error.message || "Internal Server Error",
    });
  }
};

exports.getMyOrders = async (req, res) => {
  try {
    const orders = await OrderModel.find({ user: req.user.id });
    if (orders.length === 0) {
      return res.status(404).json({ message: "No orders found" });
    }
    return res
      .status(200)
      .json({ message: "Orders fetched successfully", orders });
  } catch (error) {
    console.error("Order Error:", error.message);
    return res.status(500).json({
      message: error.message || "Internal Server Error",
    });
  }
};

exports.getOrderByID = async (req, res) => {
  try {
    const order = await OrderModel.findOne({ _id: req.params.id });
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    if (order.user.toString() !== req.user.id) {
      return res
        .status(401)
        .json({ message: "Forbidden: You don't own this order" });
    }
    return res
      .status(200)
      .json({ message: "Order fetched successfully", order });
  } catch (error) {
    console.error("Order Error:", error.message);
    return res.status(500).json({
      message: error.message || "Internal Server Error",
    });
  }
};

exports.cancelOrderByID = async (req, res) => {
  const orderId = req.params.id;
  try {
    const order = await OrderModel.findOne({ _id: orderId });
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    if (order.user.toString() !== req.user.id.toString()) {
      return res
        .status(401)
        .json({ message: "Forbidden: You don't own this order" });
    }
    //only pending orders can be cancelled
    if (order.status !== "PENDING") {
      return res
        .status(400)
        .json({ message: "Only pending orders can be cancelled" });
    }
    order.status = "CANCELLED";
    await order.save();
    return res
      .status(200)
      .json({ message: "Order cancelled successfully", order });
  } catch (error) {
    console.error("Order Error:", error.message);
    return res.status(500).json({
      message: error.message || "Internal Server Error",
    });
  }
};

exports.updateOrderAddress = async (req, res) => {
  try {
    const order = await OrderModel.findOne({ _id: req.params.id });
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    if (order.user.toString() !== req.user.id.toString()) {
      return res
        .status(401)
        .json({ message: "Forbidden: You don't own this order" });
    }
    //only pending order can have address updated
    if (order.status !== "PENDING") {
      return res
        .status(400)
        .json({ message: "Only pending orders can have address updated" });
    }
    order.shippingAddress = {
      street: req.body.shippingAddress.street,
      city: req.body.shippingAddress.city,
      state: req.body.shippingAddress.state,
      pincode: req.body.shippingAddress.pincode,
      country: req.body.shippingAddress.country,
    };
    await order.save();
    return res
      .status(200)
      .json({ message: "Order address updated successfully", order });
  } catch (error) {
    console.error("Order Error:", error.message);
    return res.status(500).json({
      message: error.message || "Internal Server Error",
    });
  }
};
