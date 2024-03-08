const express = require('express');
const zod = require('zod');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const { User } = require('./db');
const ws = require('ws');

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    credentials: true,
    origin: process.env.CLIENT_URL,
  })
);

dotenv.config();
const jwtSecret = process.env.JWT_SECRET;
const bcryptSalt = bcrypt.genSaltSync(10);

const registerSchema = zod.object({
  username: zod.string(),
  password: zod.string(),
});

app.get('/profile', async (req, res) => {
  const token = req.cookies?.token;

  if (token) {
    const decodedToken = jwt.verify(token, jwtSecret);
    res.json({ decodedToken });
  } else {
    res.status(401).json({ message: 'No token' });
  }
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const existingUser = await User.findOne({ username });

  if (existingUser) {
    const passwordOk = bcrypt.compareSync(password, existingUser.password);
    if (passwordOk) {
      const token = jwt.sign({ userId: existingUser._id, username }, jwtSecret);
      res
        .cookie('token', token, { sameSite: 'none', secure: true })
        .status(201)
        .json({ id: existingUser._id, username });
    }
  }
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

  const { username, password } = req.body;
  const hashedPassword = bcrypt.hashSync(password, bcryptSalt);
  try {
    const user = await User.create({
      username,
      password: hashedPassword,
    });

    const token = jwt.sign({ userId: user._id, username }, jwtSecret);
    res
      .cookie('token', token, { sameSite: 'none', secure: true })
      .status(201)
      .json({ id: user._id, username: req.body.username });
  } catch (error) {
    res.status(500).json({ message: 'error' });
  }
});

const server = app.listen(3000);

const wss = new ws.WebSocketServer({ server });

wss.on('connection', (connection, req) => {
  console.log('connected');
  const cookies = req.headers.cookie;

  if (cookies) {
    const tokenCookieStr = cookies
      .split(';')
      .find((str) => str.startsWith('token='));
    if (tokenCookieStr) {
      const token = tokenCookieStr.split('=')[1];
      const decodedToken = jwt.verify(token, jwtSecret);

      const { userId, username } = decodedToken;
      connection.userId = userId;
      connection.username = username;
    }
  }

  [...wss.clients].forEach((client) => {
    client.send(
      JSON.stringify({
        online: [...wss.clients].map((c) => ({
          userId: c.userId,
          username: c.username,
        })),
      })
    );
  });
});
