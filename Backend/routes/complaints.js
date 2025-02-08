const express = require("express");
const Complaint = require("../models/Complaint");

const router = express.Router();

// 🟢 Submit a Complaint
router.post("/", async (req, res) => {
  try {
    const { name, email, complaint } = req.body;
    const newComplaint = new Complaint({ name, email, complaint });

    await newComplaint.save();
    res.status(201).json({ message: "Complaint submitted successfully", complaintID: newComplaint._id });
  } catch (error) {
    res.status(500).json({ error: "Error submitting complaint" });
  }
});

// 🟡 Get All Complaints for a User
// router.put("/:id/status", async (req, res) => {
//   try {
//     console.log("Received raw request body:", req.body); // Debugging step

//     const { status } = req.body;
//     if (!status) {
//       return res.status(400).json({ error: "Status is required" });
//     }

//     const updatedComplaint = await Complaint.findByIdAndUpdate(
//       req.params.id,
//       { status },
//       { new: true }
//     );

//     if (!updatedComplaint) {
//       return res.status(404).json({ error: "Complaint not found" });
//     }

//     res.status(200).json({
//       message: "Complaint status updated successfully",
//       updatedComplaint,
//     });

//   } catch (error) {
//     console.error("Error updating complaint:", error);
//     res.status(500).json({ error: "Error updating complaint status" });
//   }
// });








router.get("/:id", async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ error: "Complaint not found" });
    }

    res.status(200).json(complaint);
  } catch (error) {
    res.status(500).json({ error: "Error fetching complaint details" });
  }
});



module.exports = router;
