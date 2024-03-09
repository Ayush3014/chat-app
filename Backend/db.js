const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

mongoose.connect(process.env.MONGO_URL);

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      unique: true,
      trim: true,
      required: true,
      maxLength: 50,
    },
    password: {
      type: String,
      required: true,
      minLength: 4,
    },
  },
  { timestamps: true }
);

const User = mongoose.model('User', UserSchema);

const MessageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    text: String,
  },
  { timestamps: true }
);

const Message = mongoose.model('Message', MessageSchema);

module.exports = {
  User,
  Message,
};
