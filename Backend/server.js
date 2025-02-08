const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();
console.log("Cloudinary Config:", {
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET ? "HIDDEN" : "NOT SET",
});

const app = express();
app.use(express.json());
app.use(cors());

// Import the upload route
const uploadRoutes = require("./routes/upload"); // path adjust
app.use("/api", uploadRoutes); //api/upload

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
