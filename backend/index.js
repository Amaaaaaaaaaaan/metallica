const express = require('express');
const app = express();
require('dotenv').config();
require('./models/db'); // This initializes your MongoDB connection
const bodyParser = require('body-parser');
const cors = require('cors');
const authRouter = require('./routes/AuthRouter');
const audioRoutes = require('./routes/audioRoutes'); // Import the audio routes

const PORT = process.env.PORT || 3000;

app.get('/ping', (req, res) => {
    res.send("PONG");
});

app.use(bodyParser.json());
app.use(cors());
app.use('/auth', authRouter);

// Mount the GridFS audio routes
app.use('/audio', audioRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`);
});
