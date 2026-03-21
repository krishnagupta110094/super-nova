const axios = require("axios");
const PaymentModel = require("../models/payment.model");
const crypto = require("crypto");

const Razorpay = require("razorpay");
const { publishToQueue } = require("../broker/broker");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

exports.createPayment = async (req, res) => {
  const token = req.cookies?.token || req.headers.authorization?.split(" ")[1];
  try {
    const orderId = req.params.orderId;
    //http://localhost:3003/api/orders/69bb5ce8292b4839ede68184
    const orderResponse = await axios.get(
      `http://localhost:3003/api/orders/${orderId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    console.log("Order Response: ", orderResponse.data);
    //create Razorpay Order Here...
    const options = {
      amount: orderResponse.data.order.totalPrice.amount * 100,
      currency: orderResponse.data.order.totalPrice.currency || "INR",
    };
    const razorpayOrder = await razorpay.orders.create(options);
    const payment = await PaymentModel.create({
      order: orderId,
      razorpayOrderId: razorpayOrder.id,
      user: req.user.id,
      price: {
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
      },
    });
    await publishToQueue("PAYMENT_SELLER_DASHBOARD.PAYMENT_CREATED", payment);
    await publishToQueue("PAYMENT_NOTIFICATION.PAYMENT_INITIATED", {
      email: req.user?.email,
      order: razorpayOrder.id,
      username: req.user?.username,
      amount: payment.price.amount / 100,
      currency: payment.price.currency,
    });
    return res.status(201).json({
      message: "Payment Initiated Successfully",
      payment,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.verifyPayment = async (req, res) => {
  const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

  const secret = process.env.RAZORPAY_KEY_SECRET;

  try {
    // 1️⃣ Generate expected signature
    const body = razorpayOrderId + "|" + razorpayPaymentId;

    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(body)
      .digest("hex");

    // 2️⃣ Compare signatures
    if (expectedSignature !== razorpaySignature) {
      await publishToQueue("PAYMENT_NOTIFICATION.PAYMENT_FAILED", {
        email: req.user?.email,
        orderId: razorpayOrderId,
        paymentId: razorpayPaymentId,
        fullName: req.user?.fullName,
      });
      return res.status(400).json({
        success: false,
        message: "Invalid payment signature",
      });
    }

    // 3️⃣ Update payment in DB
    let payment = await PaymentModel.findOne({
      razorpayOrderId: razorpayOrderId,
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment record not found",
      });
    }

    payment.paymentId = razorpayPaymentId;
    payment.signature = razorpaySignature;
    payment.status = "COMPLETED";

    await payment.save();

    //publish Payment Verify Event to Notification service
    await publishToQueue("PAYMENT_NOTIFICATION.PAYMENT_COMPLETED", {
      email: req.user.email,
      orderId: payment.order,
      paymentId: payment.paymentId,
      amount: payment.price.amount / 100,
      currency: payment.price.currency,
    });
    await publishToQueue("PAYMENT_SELLER_DASHBOARD.PAYMENT_UPDATED", payment);

    // 4️⃣ Send success response
    res.status(200).json({
      success: true,
      message: "Payment verified successfully",
      payment,
    });
  } catch (error) {
    console.error("Payment verification error:", error);
    await publishToQueue("PAYMENT_NOTIFICATION.PAYMENT_FAILED", {
      email: req.user?.email,
      orderId: razorpayOrderId,
      paymentId: razorpayPaymentId,
      fullName: req.user?.fullName,
    });
    res.status(500).json({
      success: false,
      message: "Error verifying payment",
    });
  }
};
