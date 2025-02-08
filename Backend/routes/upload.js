const express = require("express");
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;
const dotenv = require("dotenv");
const Complaint = require("../models/Complaint"); // Import Complaint model
const { v4: uuidv4 } = require("uuid");

dotenv.config();
const router = express.Router();

// Debug: Ensure dotenv is loading env variables
console.log("Cloudinary Config:", {
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY ? "Loaded" : "Missing",
  api_secret: process.env.CLOUDINARY_API_SECRET ? "Loaded" : "Missing",
});

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
    public_id: (req, file) => Date.now().toString(), // Use a unique ID instead of original name
  },
});

const upload = multer({ storage });
console.log("✅ Complaint Upload Route Loaded!");

// Debug: Ensure route is registered
console.log("Registering POST /api/complaints/upload");

// Complaint Submission Route
router.post("/upload", upload.single("image"), async (req, res) => {
  console.log("Received a POST request to /api/complaints/upload");

  // Debug: Check request body and file
  console.log("Request Body:", req.body);
  if (req.file) {
    console.log("File uploaded to Cloudinary:", req.file.path);
  } else {
    console.log("No file uploaded.");
  }

  const { name, email, contact, address, complaint } = req.body;
  const imageUrl = req.file?.path || req.file?.secure_url || "";

  if (!name || !email || !contact || !address || !complaint) {
    console.log("Validation failed: Missing required fields.");
    return res.status(400).json({ message: "All fields are required!" });
  }

  try {
    console.log("Received a POST request to /api/complaints/upload");
    console.log("Request Body:", req.body);

    const { name, email, contact, address, complaint, imageUrl } = req.body;



     // Check if this complaint already exists in the session
    if (req.session.lastComplaint === complaint) {
      return res.status(400).json({ error: "Complaint already submitted in this session!" });
    }
    console.log("Saving complaint to MongoDB...");
    const complaintId = uuidv4(); // Generates a unique complaint ID

    // Save Complaint to MongoDB
    const newComplaint = new Complaint({
      complaintId,
      name,
      email,
      contact,
      address,
      complaint,
      imageUrl,
    });

    await newComplaint.save();


    // Store the last complaint in the session to prevent duplicate submissions
    req.session.lastComplaint = complaint;
    console.log("Complaint saved successfully:", newComplaint);


    
    res.status(201).json({ message: "Complaint submitted successfully!", complaint: newComplaint });
  } catch (error) {
    console.error("Error saving complaint:", error);
    res.status(500).json({ message: "Error saving complaint", error: error.message });
  }
});

module.exports = router;
