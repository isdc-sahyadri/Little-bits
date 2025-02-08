const express = require("express");
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const Image = require("../models/Image"); // Import model

dotenv.config();
const router = express.Router();

// Cloudinary Config
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer Storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "uploads",
    format: async (req, file) => "png", // Change format if needed
    public_id: (req, file) => file.originalname,
  },
});

const upload = multer({ storage });

// Upload Route (Now Saves to MongoDB)
router.post("/upload", upload.single("image"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  try {
    // Save image URL to MongoDB
    const newImage = new Image({ imageUrl: req.file.path });
    await newImage.save();

    res.json({ message: "Image uploaded and saved!", imageUrl: req.file.path });
  } catch (error) {
    res.status(500).json({ message: "Error saving to database", error });
  }
});

module.exports = router;
