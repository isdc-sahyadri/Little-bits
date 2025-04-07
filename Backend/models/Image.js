const mongoose = require("mongoose");

const imageSchema = new mongoose.Schema({
  imageUrl: { 
    type: String, 
    required: true, 
    trim: true, 
    match: [/^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/, "Invalid image URL format"] 
  },
  uploadedAt: { 
    type: Date, 
    default: Date.now 
  }
});

const Image = mongoose.models.Image || mongoose.model("Image", imageSchema);

module.exports = Image;
