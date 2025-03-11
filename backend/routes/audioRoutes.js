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
  useUnifiedTopology: true
});

// ✅ Initialize GridFSBucket
let gridFSBucket;
conn.once("open", () => {
  gridFSBucket = new GridFSBucket(conn.db, { bucketName: "audios" });
  console.log("✅ GridFS initialized with bucket 'audios'");
});

// ✅ Configure Multer for file uploads (no multer-gridfs-storage)
const storage = multer.memoryStorage(); // Store file in memory before uploading to GridFS
const upload = multer({ storage });

// ✅ Upload an Audio File
router.post("/upload-audio", upload.single("audio"), async (req, res) => {
  try {
    const { userId } = req.body;
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    // ✅ Upload file manually to GridFS
    const uploadStream = gridFSBucket.openUploadStream(req.file.originalname, {
      metadata: { contentType: req.file.mimetype }
    });
    uploadStream.end(req.file.buffer);

    uploadStream.on("finish", async () => {
      // Save file reference in user's profile
      user.audios.push({ filename: req.file.originalname });
      await user.save();

      res.json({ success: true, filename: req.file.originalname });
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
router.get("/audio/:filename", async (req, res) => {
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

// ✅ Delete an Audio File
router.delete("/audio/:filename", async (req, res) => {
  try {
    const file = await conn.db.collection("audios.files").findOne({ filename: req.params.filename });
    if (!file) return res.status(404).json({ error: "File not found" });

    await gridFSBucket.delete(file._id);
    res.json({ message: "File deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error deleting file" });
  }
});

module.exports = router;
