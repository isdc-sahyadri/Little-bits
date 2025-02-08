const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const User = require("./models/User");

const app = express();
app.use(express.json());
app.use(cors());
// POST API to create a new user
app.post("/api/data", async (req, res) => {
  try {
    const { name, email } = req.body;
    const newUser = new User({ name, email });
    await newUser.save();
    res.status(201).json({ message: "User created successfully!", user: newUser });
  } catch (error) {
    res.status(500).json({ error: "Error creating user", details: error.message });
  }
});

// GET API to fetch all users
app.get("/api/data", async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: "Error fetching users", details: error.message });
  }
});

// Load environment variables
dotenv.config();

// Validate MongoDB URI
const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error("MONGO_URI is not defined in .env file");
  process.exit(1);
}

// Connect to MongoDB
mongoose
  .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected"))
  .catch(err => {
    console.error("MongoDB Connection Error:", err);
    process.exit(1);
  });

console.log("Cloudinary Config:", {
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET ? "HIDDEN" : "NOT SET",
});



// Import and use upload routes
const uploadRoutes = require("./routes/upload");
app.use("/api", uploadRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
