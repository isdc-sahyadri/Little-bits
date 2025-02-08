const mongoose = require("mongoose");

const ComplaintSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  contact: { type: String, required: true },
  address: { type: String, required: true },
  complaint: { type: String, required: true },
  imageUrl: { type: String, default: "" }, // Optional image URL
  createdAt: { type: Date, default: Date.now },
});

const Complaint = mongoose.models.Complaint || mongoose.model("Complaint", complaintSchema);

module.exports = Complaint;