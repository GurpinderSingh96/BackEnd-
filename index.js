require("dotenv").config(); // Load environment variables
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();

// Middleware
app.use(bodyParser.json()); // Parse JSON requests
app.use(cors()); // Handle Cross-Origin Resource Sharing

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Import Routes
const authRoutes = require("./routes/auth");
app.use("/api/auth", authRoutes);

// Start the server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));