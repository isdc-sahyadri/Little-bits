const express = require("express");
const router = express.Router();
const Feedback = require("../models/Feedback");

// Submit feedback
router.post("/submit-feedback", async (req, res) => {
    const { email, message } = req.body;
    if (!email || !message) {
        return res.status(400).json({ error: "Email and message are required" });
    }
    try {
        const newFeedback = new Feedback({ email, message });
        await newFeedback.save();
        res.json({ success: true, message: "Feedback submitted successfully" });
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
});

// Get user feedback
router.get("/user-feedback", async (req, res) => {
    const userEmail = req.query.email;
    if (!userEmail) return res.status(400).json({ error: "Email is required" });

    try {
        const feedbacks = await Feedback.find({ email: userEmail }).sort({ createdAt: -1 });
        res.json(feedbacks);
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
});

// Export the router properly
module.exports = router;
