
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const errorHandler = require("./middleware/errorHandler");
const path = require("path");
const fs = require("fs");
const { Server } = require("socket.io");
const cookieParser = require("cookie-parser");
dotenv.config();

connectDB();

// Tạo thư mục uploads nếu chưa tồn tại
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const app = express(); // ✅ app phải được khai báo trước

// Middlewares
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(cookieParser()); // ✅ sau khi app đã khai báo
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api", require("./routes/index"));
app.use("/api/admin", require("./routes/admin"));
app.use("/api/google", require("./routes/googleOAuth"));

// Image upload
app.use("/api/upload", require("./routes/upload"));

// EmailJS được sử dụng ở frontend, không cần test route

// Error Handler Middleware
app.use(errorHandler);

// Start Server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () =>
  console.log(`🚀 Server running at: http://localhost:${PORT}/`)
);

// Socket.io
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  socket.on("join", (userId) => {
    socket.join(userId);
  });

  socket.on("join-admin", () => {
    socket.join("admin");
    console.log("Admin joined");
  });

  socket.on("send-message", (message) => {
    io.to(message.receiver_id).emit("new-message", message);
  });
});

app.set("io", io);
