const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("./models/User");


dotenv.config();
const app = express();
app.use(cors());
app.use(express.json()); 
app.use((req, res, next) => {
  console.log(`Incoming Request: ${req.method} ${req.url}`);
  next();
});
app.use(express.urlencoded({ extended: true }));
  


const SECRET_KEY = process.env.JWT_SECRET || "mysecretkey";

// Signup API
app.post("/api/signup", async (req, res) => {
  try {
    const { name, email, password, confirm_password } = req.body;

    // check if passwords match
    if (password !== confirm_password) {
      return res.status(400).json({ error: "Passwords do not match" });
    }

    // check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    // create and save new user
    const newUser = new User({ name, email, password });
    await newUser.save();

    res.status(201).json({ message: "User registered successfully!" });
  } catch (error) {
    res.status(500).json({ error: "Signup failed", details: error.message });
  }
});


// Signin API
app.post("/api/signin", async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "Invalid email or password" });

    // validate password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid email or password" });

    // generate JWT Token
    const token = jwt.sign({ userId: user._id, email: user.email }, SECRET_KEY, { expiresIn: "1h" });

    res.status(200).json({ message: "Login successful!", token });
  } catch (error) {
    res.status(500).json({ error: "Signin failed", details: error.message });
  }
});

app.get("/api/user-complaints", async (req, res) => {
  const userEmail = req.query.email;
  if (!userEmail) return res.status(400).json({ error: "Email is required" });

  try {
      const complaints = await Complaint.find(
          { email: userEmail },
          { _id: 1, complaint: 1, status: 1 } // Fetch only ID, complaint details, and status
      );

      res.json(complaints);
  } catch (error) {
      res.status(500).json({ error: "Server error" });
  }
});



app.get("/api/complaint-stats", async (req, res) => {
  const userEmail = req.query.email; // Get email from query parameters

  if (!userEmail) {
    return res.status(400).json({ error: "User email is required" });
  }

  try {
    const statusCounts = await Complaint.aggregate([
      { $match: { email: userEmail } }, // Filter by email
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);

    res.json(statusCounts.map(s => ({ status: s._id, count: s.count })));
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});



app.get("/api/complaints-per-month", async (req, res) => {
  const userEmail = req.query.email; // Get email from query parameters

  if (!userEmail) {
    return res.status(400).json({ error: "User email is required" });
  }

  try {
    const monthlyCounts = await Complaint.aggregate([
      { $match: { email: userEmail } }, // Filter by email
      { $group: { _id: { $month: "$createdAt" }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    res.json(monthlyCounts.map(m => ({ month: `Month ${m._id}`, count: m.count })));
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});



// Get User Details 
app.get("/api/user", async (req, res) => {
  try {
    const token = req.headers.authorization;
    if (!token) return res.status(401).json({ error: "Unauthorized" });

    const decoded = jwt.verify(token, SECRET_KEY);
    const user = await User.findById(decoded.userId).select("-password");
    
    if (!user) return res.status(404).json({ error: "User not found" });

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: "Error fetching user details", details: error.message });
  }
});



const complaintSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  complaint: { type: String, required: true },
  complaintId: { type: String, unique: true, required: true },
  status: { type: String, default: "Pending" }, 
  date: { type: Date, default: Date.now }
});

const Complaint = mongoose.models.Complaint || mongoose.model("Complaint", complaintSchema);
module.exports = Complaint;


app.post("/api/complaints", async (req, res) => {
  try {
    const { name, email, complaint } = req.body;

    const newComplaint = new Complaint({ 
      name, 
      email, 
      complaint, 
      complaintId: new mongoose.Types.ObjectId().toString(), 
      status: "Pending" 
    });

    console.log("Complaint to be saved:", newComplaint); 

    await newComplaint.save();

    res.status(201).json({ 
      message: "Complaint submitted successfully!", 
      complaintId: newComplaint.complaintId,
      status: newComplaint.status 
    });
  } catch (error) {
    console.error("Error saving complaint:", error.message);
    res.status(500).json({ error: "Server Error", details: error.message });
  }
});



// API Route to Get Complaints
app.get("/api/complaints", async (req, res) => {
  try {
    const complaints = await Complaint.find();
    res.status(200).json(complaints);
  } catch (error) {
    res.status(500).json({ error: "Server Error" });
  }
});

// Import Routes
const complaintRoutes = require("./routes/complaints");
app.use("/api/complaints", complaintRoutes);


app.get("/api/complaints/:complaintId/status", async (req, res) => {
  try {
    const { complaintId } = req.params;

    const complaint = await Complaint.findOne({ complaintId });

    if (!complaint) {
      return res.status(404).json({ error: "Complaint not found" });
    }

    res.status(200).json({ complaintId: complaint.complaintId, status: complaint.status });
  } catch (error) {
    console.error("Error fetching complaint status:", error.message);
    res.status(500).json({ error: "Server Error", details: error.message });
  }
});

const feedbackRoutes = require("./routes/feedback");
app.use("/api", feedbackRoutes);


const uploadRoutes = require("./routes/upload"); // Ensure the path is correct
app.use("/api/complaints", uploadRoutes); 

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log(" MongoDB connected"))
  .catch(err => console.error("MongoDB Connection Error:", err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
