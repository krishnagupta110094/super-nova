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
};
