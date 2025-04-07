const express = require("express");
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;
const dotenv = require("dotenv");
const Complaint = require("../models/Complaint");
const { v4: uuidv4 } = require("uuid");

dotenv.config();
const router = express.Router();

// Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer Storage (Cloudinary)
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "complaints",
    format: async () => "png",
    public_id: () => Date.now().toString(),
  },
});
const upload = multer({ storage });

// Complaint Submission Route
router.post("/upload", upload.single("image"), async (req, res) => {
  console.log("Received a POST request to /api/complaints/upload");

  const { name, email, contact, address, complaint } = req.body;
  const imageUrl = req.file?.secure_url || req.file?.path || "";

  if (!name || !email || !contact || !address || !complaint) {
    return res.status(400).json({ message: "All fields are required!" });
  }

  try {
    // Check for duplicate complaint
    const existingComplaint = await Complaint.findOne({ complaint, email });
    if (existingComplaint) {
      return res.status(400).json({ error: "Complaint already submitted!" });
    }

    // Generate unique ID for complaint
    const complaintId = uuidv4();

    // Save to MongoDB
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
    res.status(201).json({ message: "Complaint submitted successfully!", complaint: newComplaint });
  } catch (error) {
    console.error("Error saving complaint:", error);
    res.status(500).json({ message: "Error saving complaint", error: error.message });
  }
});

module.exports = router;
