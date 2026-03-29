import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import dns, { setServers } from "dns";
import complaintRoutes from "./routes/complaint.js";
import uploadRoutes from "./routes/upload.js";
import aiRoutes from "./routes/ai.js";

dns.setServers(["1.1.1.1","8.8.8.8"]);

console.log("Starting server...");

// Load env first
dotenv.config();

// Then connect DB
connectDB();

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/ai", aiRoutes);

app.use("/api/complaints", complaintRoutes);
app.use("/api/upload", uploadRoutes);

app.get("/", (req, res) => {
  res.send("🚀 Backend is running...");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});