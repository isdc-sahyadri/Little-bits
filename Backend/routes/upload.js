const express = require("express");
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;
const dotenv = require("dotenv");
const Complaint = require("../models/Complaint"); // Import Complaint model
const { v4: uuidv4 } = require("uuid");

dotenv.config();
const router = express.Router();

// Cloudinary Config
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer Storage (For Image Upload)
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "complaints",
    format: async (req, file) => "png", // Change format if needed
    public_id: (req, file) => Date.now().toString(), // Unique filename
  },
});

const upload = multer({ storage });

console.log("✅ Complaint Upload Route Loaded!");

// Complaint Submission Route
router.post("/upload", upload.single("image"), async (req, res) => {
  console.log("Received a POST request to /api/complaints/upload");

  const { name, email, contact, address, complaint } = req.body;
  const imageUrl = req.file?.path || req.file?.secure_url || ""; // Extracting the correct Cloudinary URL

  // Validate required fields
  if (!name || !email || !contact || !address || !complaint) {
    console.log("Validation failed: Missing required fields.");
    return res.status(400).json({ message: "All fields are required!" });
  }

  try {
    console.log("Saving complaint to MongoDB...");
    const complaintId = uuidv4(); // Generate a unique complaint ID

    // Save Complaint to MongoDB
    const newComplaint = new Complaint({
      complaintId,
      name,
      email,
      contact,
      address,
      complaint,
      imageUrl, // Storing the image URL
      status: "Pending",
    });

    await newComplaint.save();

    console.log("Complaint saved successfully:", newComplaint);
    
    res.status(201).json({ 
      message: "Complaint submitted successfully!", 
      complaint: newComplaint 
    });

  } catch (error) {
    console.error("Error saving complaint:", error);
    res.status(500).json({ message: "Error saving complaint", error: error.message });
  }
});

module.exports = router;
