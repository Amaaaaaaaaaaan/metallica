const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AudioSchema = new Schema({
  filename: {
    type: String,
    required: true
  },
  uploadDate: {
    type: Date,
    default: Date.now
  }
});

const UserSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
    },
    audios: [AudioSchema] // Array of audio references
});

const UserModel = mongoose.model('users', UserSchema);
module.exports = UserModel;
