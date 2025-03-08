// backend/routes/audioRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const { GridFsStorage } = require('multer-gridfs-storage');
const mongoose = require('mongoose');
const Grid = require('gridfs-stream');
const User = require('../models/user'); // Adjust path if needed
require('dotenv').config();

const mongoURI = process.env.MONGO_CONN;

// Create a separate mongoose connection for GridFS.
const conn = mongoose.createConnection(mongoURI);

let gfs;
conn.once('open', function () {
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection('audios'); // Files will be stored in the 'audios' bucket
  console.log("GridFS initialized with bucket 'audios'");
});

// Configure GridFsStorage using the new API style that returns an object.
const storage = new GridFsStorage({
  url: mongoURI,
  file: (req, file) => {
    console.log("Uploading file:", file.originalname);
    return {
      filename: `${Date.now()}-${file.originalname}`,
      bucketName: 'audios',
      metadata: { contentType: file.mimetype }
    };
  }
});

const upload = multer({ storage });

// POST route: Upload an audio file
// Expect the field name "audio" and a "userId" in the form-data.
router.post('/upload-audio', upload.single('audio'), async (req, res) => {
  try {
    const { userId } = req.body;
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    // Find the user by id.
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    // Save a reference to the file in the user's audios array.
    user.audios.push({
      filename: req.file.filename
      // uploadDate will default to Date.now in your schema.
    });

    await user.save();
    res.json({ success: true, file: req.file, audios: user.audios });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// GET route: Stream an audio file by its ObjectId.
router.get('/audio/:id', (req, res) => {
  let fileId;
  try {
    fileId = new mongoose.Types.ObjectId(req.params.id);
  } catch (err) {
    return res.status(400).json({ error: "Invalid file id" });
  }
  gfs.files.findOne({ _id: fileId }, (err, file) => {
    if (err || !file) {
      return res.status(404).json({ error: "File not found" });
    }
    res.set('Content-Type', file.metadata && file.metadata.contentType ? file.metadata.contentType : 'audio/mpeg');
    const readStream = gfs.createReadStream({ _id: file._id });
    readStream.pipe(res);
  });
});

// Optional: GET route to list all audio files stored in GridFS.
router.get('/list-audios', (req, res) => {
  gfs.files.find().toArray((err, files) => {
    if (err || !files || files.length === 0) {
      return res.status(404).json({ error: "No files found" });
    }
    res.json(files);
  });
});

module.exports = router;
