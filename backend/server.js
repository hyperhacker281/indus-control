require("dotenv").config();
const express = require("express");
const cors = require("cors");
const equipmentRoutes = require("./routes/equipment");

// Debug: Check if environment variables are loaded
console.log("\n🔍 Environment Variables Check:");
console.log(
  "   TENANT_ID:",
  process.env.TENANT_ID ? "✅ Loaded" : "❌ Not found"
);
console.log(
  "   CLIENT_ID:",
  process.env.CLIENT_ID ? "✅ Loaded" : "❌ Not found"
);
console.log(
  "   CLIENT_SECRET:",
  process.env.CLIENT_SECRET ? "✅ Loaded" : "❌ Not found"
);
console.log("   DATAVERSE_URL:", process.env.DATAVERSE_URL || "❌ Not found");
console.log("");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.use("/api/equipment", equipmentRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "Indus Control API is running",
    timestamp: new Date().toISOString(),
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({
    success: false,
    error: "Internal server error",
    message: err.message,
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Route not found",
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📡 API available at http://localhost:${PORT}/api`);
  console.log(`🏥 Health check at http://localhost:${PORT}/api/health`);
});
