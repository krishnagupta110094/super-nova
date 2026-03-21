const sendEmail = require("../email");
const { subscribeToQueue } = require("./broker");

module.exports = function () {
  subscribeToQueue("AUTH_NOTIFICATION.USER_CREATED", async (data) => {
    const emailHTMLTemplate = `
    <div style="font-family: Arial, sans-serif; background-color: #f4f6f8; padding: 20px;">
      
      <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
        
        <!-- Header -->
        <div style="background: linear-gradient(90deg, #4CAF50, #2E7D32); padding: 20px; text-align: center; color: white;">
          <h1 style="margin: 0;">🚀 Welcome to SuperNova</h1>
        </div>

        <!-- Body -->
        <div style="padding: 20px; color: #333;">
          <h2>Hello ${data?.fullName?.firstName || "User"} 👋</h2>
          
          <p>
            We're excited to have you onboard! Your account has been successfully created.
          </p>

          <p><strong>📧 Email:</strong> ${data.email}</p>
          <p><strong>👤 Username:</strong> ${data.username}</p>
          <p><strong>🎯 Role:</strong> ${data.role}</p>

          <div style="margin: 20px 0; text-align: center;">
            <a href="#" 
              style="background: #4CAF50; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">
              Get Started
            </a>
          </div>

          <p>
            If you have any questions, feel free to reach out. We're here to help!
          </p>

          <p>Cheers,<br/><strong>SuperNova Team</strong></p>
        </div>

        <!-- Footer -->
        <div style="background: #f1f1f1; padding: 15px; text-align: center; font-size: 12px; color: #777;">
          © 2026 SuperNova. All rights reserved.
        </div>

      </div>
    </div>
    `;

    await sendEmail(
      data.email,
      "🎉 Welcome to SuperNova!",
      "Thank you for registering!",
      emailHTMLTemplate,
    );
  });

  subscribeToQueue("PAYMENT_NOTIFICATION.PAYMENT_COMPLETED", async (data) => {
    const emailHTMLTemplate = `
    <div style="font-family: Arial, sans-serif; background-color: #f4f6f8; padding: 20px;">
      
      <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
        
        <!-- Header -->
        <div style="background: linear-gradient(90deg, #28a745, #218838); padding: 20px; text-align: center; color: white;">
          <h1 style="margin: 0;">✅ Payment Successful</h1>
        </div>

        <!-- Body -->
        <div style="padding: 20px; color: #333;">
          
          <h2>Hello 👋</h2>

          <p>Your payment has been successfully processed. Here are your transaction details:</p>

          <!-- Payment Details Box -->
          <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 15px 0;">
            
            <p><strong>🧾 Order ID:</strong> ${data.orderId}</p>
            <p><strong>💳 Payment ID:</strong> ${data.paymentId}</p>
            <p><strong>💰 Amount Paid:</strong> ${data.amount} ${data.currency}</p>

          </div>

          <p>
            Thank you for your purchase! Your order is now being processed.
          </p>

          <!-- CTA -->
          <div style="text-align: center; margin: 20px 0;">
            <a href="#" 
              style="background: #28a745; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">
              View Order
            </a>
          </div>

          <p>If you have any questions, feel free to contact our support team.</p>

          <p>Regards,<br/><strong>SuperNova Team</strong></p>
        </div>

        <!-- Footer -->
        <div style="background: #f1f1f1; padding: 15px; text-align: center; font-size: 12px; color: #777;">
          © 2026 SuperNova. All rights reserved.
        </div>

      </div>
    </div>
    `;

    await sendEmail(
      data.email,
      "💸 Payment Successful - SuperNova",
      "Your payment has been successfully completed",
      emailHTMLTemplate,
    );
  });

  subscribeToQueue("PAYMENT_NOTIFICATION.PAYMENT_FAILED", async (data) => {
    const userName =
      `${data?.fullName?.firstName || ""} ${data?.fullName?.lastName || ""}`.trim() ||
      "User";

    const emailHTMLTemplate = `
    <div style="font-family: Arial, sans-serif; background-color: #f4f6f8; padding: 20px;">
      
      <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
        
        <!-- Header -->
        <div style="background: linear-gradient(90deg, #dc3545, #b02a37); padding: 20px; text-align: center; color: white;">
          <h1 style="margin: 0;">❌ Payment Failed</h1>
        </div>

        <!-- Body -->
        <div style="padding: 20px; color: #333;">
          
          <h2>Hello ${userName} 👋</h2>

          <p>
            Unfortunately, your recent payment attempt was not successful.
          </p>

          <!-- Payment Details -->
          <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 15px 0;">
            
            <p><strong>🧾 Order ID:</strong> ${data.orderId}</p>
            <p><strong>💳 Payment ID:</strong> ${data.paymentId}</p>

          </div>

          <p>
            Please try again or use a different payment method.
          </p>

          <!-- CTA -->
          <div style="text-align: center; margin: 20px 0;">
            <a href="https://yourfrontend.com/payment/${data.orderId}" 
              style="background: #dc3545; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">
              Retry Payment
            </a>
          </div>

          <p>If the issue persists, contact our support team.</p>

          <p>Regards,<br/><strong>SuperNova Team</strong></p>
        </div>

        <!-- Footer -->
        <div style="background: #f1f1f1; padding: 15px; text-align: center; font-size: 12px; color: #777;">
          © 2026 SuperNova. All rights reserved.
        </div>

      </div>
    </div>
    `;

    await sendEmail(
      data.email,
      "❌ Payment Failed - SuperNova",
      "Your payment attempt failed. Please try again.",
      emailHTMLTemplate,
    );
  });

  subscribeToQueue("PAYMENT_NOTIFICATION.PAYMENT_INITIATED", async (data) => {
    try {
      console.log("📩 Payment Initiated Event:", data);

      const userName = `${data?.username} ` || "User";

      const emailHTMLTemplate = `
    <div style="font-family: Arial, sans-serif; background-color: #f4f6f8; padding: 20px;">
      
      <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 6px 15px rgba(0,0,0,0.1);">
        
        <!-- Header -->
        <div style="background: linear-gradient(90deg, #007bff, #0056b3); padding: 20px; text-align: center; color: white;">
          <h1 style="margin: 0;">💳 Payment Initiated</h1>
        </div>

        <!-- Body -->
        <div style="padding: 25px; color: #333;">
          
          <h2>Hello ${userName} 👋</h2>

          <p>
            Your payment process has been successfully initiated. Please complete the payment to confirm your order.
          </p>

          <!-- Details Box -->
          <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
            
            <p><strong>🧾 Order ID:</strong> ${data.order}</p>
            <p><strong>💰 Amount:</strong> ${data.amount} ${data.currency}</p>

          </div>

          <!-- CTA -->
          <div style="text-align: center; margin: 25px 0;">
            <a href="https://yourfrontend.com/payment/${data.order}" 
              style="background: #007bff; color: white; padding: 14px 22px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              Complete Payment
            </a>
          </div>

          <p>
            ⚠️ Note: Your order will be confirmed only after successful payment.
          </p>

          <p>
            If you did not initiate this request, please ignore this email.
          </p>

          <p>Thanks,<br/><strong>SuperNova Team 🚀</strong></p>
        </div>

        <!-- Footer -->
        <div style="background: #f1f1f1; padding: 15px; text-align: center; font-size: 12px; color: #777;">
          © 2026 SuperNova. All rights reserved.
        </div>

      </div>
    </div>
    `;

      await sendEmail(
        data.email,
        "💳 Complete Your Payment - SuperNova",
        "Your payment has been initiated. Complete it now.",
        emailHTMLTemplate,
      );

      console.log("✅ Payment initiated email sent");
    } catch (error) {
      console.error("❌ Error in PAYMENT_INITIATED listener:", error);
    }
  });

  subscribeToQueue("PRODUCT_NOTIFICATION.PRODUCT_CREATED", async (data) => {
    try {
      console.log("📩 Product Created Event:", data);

      const userName = data.username || "Seller";

      const emailHTMLTemplate = `
    <div style="font-family: Arial, sans-serif; background-color: #f4f6f8; padding: 20px;">
      
      <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 6px 15px rgba(0,0,0,0.1);">
        
        <!-- Header -->
        <div style="background: linear-gradient(90deg, #28a745, #1e7e34); padding: 20px; text-align: center; color: white;">
          <h1 style="margin: 0;">📦 Product Created Successfully</h1>
        </div>

        <!-- Body -->
        <div style="padding: 25px; color: #333;">
          
          <h2>Hello ${userName} 👋</h2>

          <p>
            Great news! Your product has been successfully created and is now available in your dashboard.
          </p>

          <!-- Details Box -->
          <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
            
            <p><strong>🆔 Product ID:</strong> ${data.productId}</p>
            <p><strong>👤 Seller ID:</strong> ${data.sellerId}</p>

          </div>

          <!-- CTA -->
          <div style="text-align: center; margin: 25px 0;">
            <a href="https://yourfrontend.com/seller/products/${data.productId}" 
              style="background: #28a745; color: white; padding: 14px 22px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              View Product
            </a>
          </div>

          <p>
            🚀 You can now manage your product, update details, and track performance directly from your dashboard.
          </p>

          <p>
            Keep adding amazing products and grow your business with <strong>SuperNova</strong>!
          </p>

          <p>Cheers,<br/><strong>SuperNova Team 💚</strong></p>
        </div>

        <!-- Footer -->
        <div style="background: #f1f1f1; padding: 15px; text-align: center; font-size: 12px; color: #777;">
          © 2026 SuperNova. All rights reserved.
        </div>

      </div>
    </div>
    `;

      await sendEmail(
        data.email,
        "📦 Your Product is Live on SuperNova!",
        "Your product has been successfully created.",
        emailHTMLTemplate,
      );

      console.log("✅ Product created email sent");
    } catch (error) {
      console.error("❌ Error in PRODUCT_CREATED listener:", error);
    }
  });
};
