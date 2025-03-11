const express = require("express");
const router = express.Router();
const multer = require("multer");
const mongoose = require("mongoose");
const { GridFSBucket } = require("mongodb");
const User = require("../models/user"); // Adjust path if needed
require("dotenv").config();

const mongoURI = process.env.MONGO_CONN || "mongodb://localhost:27017/music-app";

// ✅ Create Mongoose Connection
const conn = mongoose.createConnection(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// ✅ Initialize GridFSBucket
let gridFSBucket;
conn.once("open", () => {
  gridFSBucket = new GridFSBucket(conn.db, { bucketName: "audios" });
  console.log("✅ GridFS initialized with bucket 'audios'");
});

// ✅ Configure Multer for file uploads (using memory storage)
const storage = multer.memoryStorage();
const upload = multer({ storage });
router.post("/upload-audio", upload.single("audio"), async (req, res) => {
  try {
    const { userId, title, description } = req.body;
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    // Find the user by id.
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    // Check that a title is provided; otherwise, fallback to a default title.
    const providedTitle = title && title.trim().length > 0 ? title.trim() : "Untitled Recording";
    // Sanitize title: replace spaces with underscores and remove unwanted characters if needed.
    const sanitizedTitle = providedTitle.replace(/\s+/g, "_");
    // Extract extension from mimetype (for example: "webm" from "audio/webm")
    const fileExt = req.file.mimetype.split("/")[1] || "webm";
    // Create a custom filename using the title
    const customFileName = `${sanitizedTitle}.${fileExt}`;

    console.log("Custom file name:", customFileName);

    // Upload file manually to GridFS using the custom file name.
    const uploadStream = gridFSBucket.openUploadStream(customFileName, {
      metadata: { 
        contentType: req.file.mimetype,
        title: providedTitle, // store the original title in metadata if needed
      },
    });
    uploadStream.end(req.file.buffer);

    uploadStream.on("finish", async () => {
      // Save file reference in user's profile including the description.
      user.audios.push({ 
        filename: customFileName,
        description: description || "",
      });
      await user.save();

      res.json({ success: true, filename: customFileName });
    });

    uploadStream.on("error", (err) => {
      console.error("Upload error:", err);
      res.status(500).json({ error: "File upload failed" });
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});


// ✅ Stream an Audio File
router.get("/:filename", async (req, res) => {
  try {
    const file = await conn.db.collection("audios.files").findOne({ filename: req.params.filename });
    if (!file) return res.status(404).json({ error: "File not found" });
    res.set("Content-Type", file.metadata?.contentType || "audio/mpeg");
    const readStream = gridFSBucket.openDownloadStreamByName(req.params.filename);
    readStream.pipe(res);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});


// ✅ List All Uploaded Audio Files
router.get("/list-audios", async (req, res) => {
  try {
    const files = await conn.db.collection("audios.files").find().toArray();
    if (!files || files.length === 0) return res.status(404).json({ error: "No files found" });

    res.json(files);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

router.delete("/:filename", async (req, res) => {
  try {
    const filename = req.params.filename;
    const file = await conn.db.collection("audios.files").findOne({ filename });
    if (!file) return res.status(404).json({ error: "File not found" });
    await gridFSBucket.delete(file._id);
    // Optionally remove file reference from user document if needed.
    const { userId } = req.query;
    if (userId) {
      await User.updateOne(
        { _id: userId },
        { $pull: { audios: { filename } } }
      );
    }
    res.json({ message: "File deleted successfully" });
  } catch (err) {
    console.error("Error deleting file:", err);
    res.status(500).json({ error: "Error deleting file" });
  }
});

// Add this new route in your audioRoutes.js
router.get("/user-audios/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });
    
    // Assuming the recordings are stored in the user's audios array.
    res.json(user.audios);
  } catch (err) {
    console.error("Error fetching user recordings:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
