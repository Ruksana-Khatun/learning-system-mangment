import { config } from 'dotenv';
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import { errorMiddleware } from "./middlewares/error.Middleware.js";
import userRoutes from './routes/user.routes.js';
import adminRoutes from './routes/admin.routes.js';
import courseRoutes from './routes/course.routes.js';
import paymentRoutes from './routes/payment.routes.js';
import upload from "./middlewares/multer.middleware.js";
import { login, register } from "./controllers/user.controller.js";

config();
const app = express();

// middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// CORS – allow frontend dev server and tools to call the API
// In development we accept any origin and send credentials (cookies).
// For production, you can tighten this to a specific domain.
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow server-to-server / Postman (no origin) and all browser origins in dev
      callback(null, true);
    },
    credentials: true,
  })
);
app.use(cookieParser());
app.use(morgan("dev"));

// Health / status
app.get("/", (req, res) => {
  res.send("Course enrolment API – use /api for status.");
});
app.get("/api", (req, res) => {
  res.send("API is running...");
});
app.get("/api/v1", (req, res) => {
  res.send("API v1 is running...");
});

// Auth routes at /api/auth/* (explicit so they always match)
app.post("/api/auth/login", login);
app.post("/api/auth/register", upload.single("avatar"), register);

// Fix malformed logout path (e.g. /user/%20logout -> /user/logout)
app.use((req, res, next) => {
  if (req.url && req.url.includes('%20logout')) {
    req.url = req.url.replace(/%20logout/g, 'logout');
  }
  next();
});

// User routes at /api/v1/user and /api/auth (rest of auth: logout, me, reset, etc.)
app.use("/api/v1/user", userRoutes);
app.use("/api/auth", userRoutes);

// Admin routes
app.use("/api/admin", adminRoutes);
app.use("/api/v1/admin", adminRoutes);

// Course routes
app.use("/api/v1/course", courseRoutes);

// Payment routes (mount under both /payment and /payments for frontend compatibility)
app.use("/api/v1/payment", paymentRoutes);
app.use("/api/v1/payments", paymentRoutes);

// 404 catch-all (must be after all other routes)
app.all("/*", (req, res) => {
  res.status(404).send('Oops!! 404 Page Not Found');
});
app.use(errorMiddleware);

export default app;

