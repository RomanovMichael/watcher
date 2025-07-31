import express from "express";
import cors from "cors";
import dotenv from "dotenv";
// import https from 'https';
// import fs from 'fs';
import authRoutes from "./routes/auth.routes";

// Загружаем переменные окружения
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "https://localhost",
    credentials: true,
  })
);
app.use(express.json());

// Роуты
app.use("/api/auth", authRoutes);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// HTTP сервер
app.listen(PORT, () => {
  console.log(`🚀 HTTP Сервер запущен на порту ${PORT}`);
  console.log(
    `📱 Frontend URL: ${process.env.FRONTEND_URL || "https://localhost"}`
  );
});
