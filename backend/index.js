// Load environment variables FIRST
import dotenv from "dotenv";
dotenv.config();

// Core imports
import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { PrismaClient } from "@prisma/client";

// Init
const prisma = new PrismaClient();
const app = express();

// Middleware
app.use(helmet());
app.use(cors());  // Allow frontend to connect
app.use(express.json());
app.use(cookieParser());

// Routes
import authRoutes from "./routes/auth.js";
import campaignRoutes from "./routes/campaign.js";
import trackRoutes from "./routes/track.js";

app.use("/auth", authRoutes);
app.use("/campaign", campaignRoutes);
app.use("/track", trackRoutes);

// Test route
app.get("/", (req, res) => {
  res.send("Backend is running");
});

// Start server
app.listen(4000, () => {
  console.log("Server running on http://localhost:4000");
});
