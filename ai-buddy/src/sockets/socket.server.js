const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const cookie = require("cookie");
const { processAIQuery } = require("../services/ai.service");

async function initSocketServer(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: "*", // adjust in prod
    },
  });

  // 🔐 Auth Middleware
  io.use((socket, next) => {
    const cookieHeader = socket.handshake.headers?.cookie;
    const cookies = cookieHeader ? cookie.parse(cookieHeader) : {};
    const token = cookies.token;

    if (!token) {
      return next(new Error("Token not Provided..."));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded;
      socket.token = token;
      next();
    } catch (error) {
      next(new Error("Token Invalid..."));
    }
  });

  // 🔌 Connection
  io.on("connection", (socket) => {
    console.log("Socket User:", socket.user);

    socket.on("message", async (message) => {
      try {
        console.log("User Message:", message);

        const response = await processAIQuery(
          message,
          socket.user?.id || "123",
          socket.token,
        );

        socket.emit("ai-response", response);
      } catch (err) {
        console.error("Socket Error:", err.message);

        socket.emit("ai-response", {
          success: false,
          message: "Internal socket error",
        });
      }
    });

    socket.on("disconnect", () => {
      console.log("User disconnected");
    });
  });
}

module.exports = { initSocketServer };
