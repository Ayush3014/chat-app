const express = require('express');
const zod = require('zod');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const cors = require('cors');
const { User } = require('./db');

const app = express();
app.use(express.json());
app.use(
  cors({
    credentials: true,
    origin: process.env.CLIENT_URL,
  })
);

dotenv.config();
const jwtSecret = process.env.JWT_SECRET;

const registerSchema = zod.object({
  username: zod.string(),
  password: zod.string(),
});

app.post('/register', async (req, res) => {
  const { success } = registerSchema.safeParse(req.body);
  if (!success) {
    return res.status(411).json({ message: 'Incorrect inputs' });
  }

  const existingUser = await User.findOne({
    username: req.body.username,
  });

  if (existingUser) {
    return res.status(411).json({ message: 'User already exists!' });
  }

  try {
    const user = await User.create({
      username: req.body.username,
      password: req.body.password,
    });

    const token = jwt.sign({ userId: user._id }, jwtSecret);
    res.cookie('token', token).status(201).json({ id: user._id });
  } catch (error) {
    res.status(500).json({ message: 'error' });
  }
});

app.listen(3000);
