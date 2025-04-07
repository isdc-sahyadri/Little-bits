const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema({
    email: { 
        type: String, 
        required: true,
        trim: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"]
    },
    message: { 
        type: String, 
        required: true, 
        trim: true,
        minlength: [5, "Feedback message must be at least 5 characters long"]
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    }
});

const Feedback = mongoose.models.Feedback || mongoose.model("Feedback", feedbackSchema);

module.exports = Feedback;
