const express = require("express");
const Complaint = require("../models/Complaint");

const router = express.Router();

// 🟢 Submit a Complaint
router.post("/", async (req, res) => {
  try {
    const { name, email, contact, address, complaint, imageUrl } = req.body;

    // Validate input
    if (!name || !email || !contact || !address || !complaint) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const newComplaint = new Complaint({
      name,
      email,
      contact,
      address,
      complaint,
      imageUrl: imageUrl || "", // Optional image
    });

    await newComplaint.save();
    res.status(201).json({ message: "Complaint submitted successfully", complaintID: newComplaint._id });
  } catch (error) {
    console.error("Error submitting complaint:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// 🟡 Get a Complaint by ID
router.get("/:id", async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ error: "Complaint not found" });
    }
    res.status(200).json(complaint);
  } catch (error) {
    console.error("Error fetching complaint:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// 🔵 Get All Complaints
router.get("/", async (req, res) => {
  try {
    const complaints = await Complaint.find().sort({ createdAt: -1 });
    res.status(200).json(complaints);
  } catch (error) {
    console.error("Error fetching complaints:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// 🟠 Update Complaint Status
router.put("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: "Status is required" });
    }

    const updatedComplaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!updatedComplaint) {
      return res.status(404).json({ error: "Complaint not found" });
    }

    res.status(200).json({
      message: "Complaint status updated successfully",
      updatedComplaint,
    });
  } catch (error) {
    console.error("Error updating complaint status:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// 🟣 Delete a Complaint
router.delete("/:id", async (req, res) => {
  try {
    const deletedComplaint = await Complaint.findByIdAndDelete(req.params.id);

    if (!deletedComplaint) {
      return res.status(404).json({ error: "Complaint not found" });
    }

    res.status(200).json({ message: "Complaint deleted successfully" });
  } catch (error) {
    console.error("Error deleting complaint:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
