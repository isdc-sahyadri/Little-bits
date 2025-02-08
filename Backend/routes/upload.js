const express = require("express");
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;
const dotenv = require("dotenv");

dotenv.config();
const router = express.Router();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure Multer with Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "uploads",
    format: async (req, file) => "png",
    public_id: (req, file) => file.originalname,
  },
});

const upload = multer({ storage });

//  Debug Log
console.log("Upload route initialized");

//  Test Route
router.get("/upload", (req, res) => {
  console.log("GET /api/upload hit"); // This should appear in your terminal
  res.send("Upload route is working");
});

// Upload Route
router.post("/upload", upload.single("image"), (req, res) => {
  console.log("POST /api/upload hit"); 
  if (!req.file) {
    console.log("No file uploaded"); 
    return res.status(400).json({ message: "No file uploaded" });
  }
  console.log("File uploaded:", req.file.path); 
  res.json({ imageUrl: req.file.path });
});

module.exports = router;
