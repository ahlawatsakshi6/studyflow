require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Enhanced CORS configuration for production
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-domain.com', 'https://www.your-domain.com'] 
    : ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// In-memory store for OTPs (for demo only - use Redis in production)
const otpStore = {};

// Configure nodemailer for Gmail using .env
const transporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false
  }
});

// Generate a 6-digit OTP
function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send OTP endpoint with enhanced error handling
app.post('/api/send-otp', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    const otp = generateOtp();
    otpStore[email] = { 
      otp, 
      expires: Date.now() + 10 * 60 * 1000, // 10 min expiry
      attempts: 0
    };

    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: email,
      subject: 'StudyFlow - Email Verification OTP',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1976d2;">StudyFlow Email Verification</h2>
          <p>Hello!</p>
          <p>Your verification code is:</p>
          <div style="background: #f5f5f5; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
            <h1 style="color: #1976d2; font-size: 32px; margin: 0; letter-spacing: 4px;">${otp}</h1>
          </div>
          <p>This code will expire in 10 minutes.</p>
          <p>If you didn't request this code, please ignore this email.</p>
          <hr style="margin: 20px 0;">
          <p style="color: #666; font-size: 12px;">StudyFlow - Your Study Companion</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`OTP sent to ${email}`);
    res.json({ success: true, message: 'OTP sent successfully' });
    
  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).json({ 
      error: 'Failed to send OTP. Please try again later.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Verify OTP endpoint with enhanced security
app.post('/api/verify-otp', (req, res) => {
  try {
    const { email, otp } = req.body;
    
    if (!email || !otp) {
      return res.status(400).json({ error: 'Email and OTP are required' });
    }

    const record = otpStore[email];
    
    if (!record) {
      return res.json({ verified: false, error: 'OTP not found or expired' });
    }

    if (Date.now() > record.expires) {
      delete otpStore[email];
      return res.json({ verified: false, error: 'OTP has expired' });
    }

    if (record.attempts >= 3) {
      delete otpStore[email];
      return res.json({ verified: false, error: 'Too many attempts. Please request a new OTP.' });
    }

    record.attempts++;

    if (record.otp === otp) {
      delete otpStore[email];
      console.log(`Email verified for ${email}`);
      return res.json({ verified: true, message: 'Email verified successfully' });
    } else {
      return res.json({ verified: false, error: 'Incorrect OTP' });
    }
    
  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({ 
      error: 'Verification failed. Please try again.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../studyflow/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../studyflow/build', 'index.html'));
  });
}

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? ['https://your-domain.com', 'https://www.your-domain.com'] 
      : ['http://localhost:3000', 'http://localhost:3001'],
    methods: ['GET', 'POST']
  }
});

// In-memory room members: { roomId: Set of usernames }
const roomMembers = {};

// In-memory user data: { socketId: { userName, friends: [], pending: [] } }
const users = {};
const userNameToSocket = {}; // { userName: socketId }

io.on('connection', (socket) => {
  let currentRoom = null;
  let username = null;

  console.log('User connected:', socket.id);

  // Register user for friend system
  socket.on('register', (userName) => {
    users[socket.id] = users[socket.id] || { userName, friends: [], pending: [] };
    userNameToSocket[userName] = socket.id;
    // Send current friends/pending to the user
    socket.emit('friendsList', users[socket.id].friends);
    socket.emit('pendingRequests', users[socket.id].pending);
    console.log(`User registered: ${userName}`);
  });

  // Handle sending a friend request
  socket.on('sendFriendRequest', (toUserName) => {
    const fromUser = users[socket.id];
    const toSocketId = userNameToSocket[toUserName];
    if (toSocketId && users[toSocketId] && fromUser) {
      users[toSocketId].pending = users[toSocketId].pending || [];
      users[toSocketId].pending.push(fromUser.userName);
      io.to(toSocketId).emit('pendingRequests', users[toSocketId].pending);
      console.log(`Friend request sent from ${fromUser.userName} to ${toUserName}`);
    }
  });

  // Handle accepting a friend request
  socket.on('acceptFriendRequest', (fromUserName) => {
    const toUser = users[socket.id];
    const fromSocketId = userNameToSocket[fromUserName];
    if (fromSocketId && users[fromSocketId] && toUser) {
      // Add each other as friends
      toUser.friends = toUser.friends || [];
      users[fromSocketId].friends = users[fromSocketId].friends || [];
      toUser.friends.push(fromUserName);
      users[fromSocketId].friends.push(toUser.userName);

      // Remove from pending
      toUser.pending = (toUser.pending || []).filter(u => u !== fromUserName);

      // Notify both users
      socket.emit('friendsList', toUser.friends);
      io.to(fromSocketId).emit('friendsList', users[fromSocketId].friends);
      socket.emit('pendingRequests', toUser.pending);
      console.log(`Friend request accepted between ${toUser.userName} and ${fromUserName}`);
    }
  });

  // Handle rejecting a friend request
  socket.on('rejectFriendRequest', (fromUserName) => {
    const toUser = users[socket.id];
    if (toUser) {
      toUser.pending = (toUser.pending || []).filter(u => u !== fromUserName);
      socket.emit('pendingRequests', toUser.pending);
      console.log(`Friend request rejected by ${toUser.userName} from ${fromUserName}`);
    }
  });

  socket.on('join-room', ({ roomId, user }) => {
    username = user;
    currentRoom = roomId;
    socket.join(roomId);
    if (!roomMembers[roomId]) roomMembers[roomId] = new Set();
    roomMembers[roomId].add(username);
    // Notify all in room
    io.to(roomId).emit('room-members', Array.from(roomMembers[roomId]));
    // Welcome message
    socket.to(roomId).emit('chat-message', { sender: 'System', text: `${username} joined the room.`, time: Date.now() });
    console.log(`User ${username} joined room ${roomId}`);
  });

  socket.on('leave-room', () => {
    if (currentRoom && username) {
      socket.leave(currentRoom);
      if (roomMembers[currentRoom]) {
        roomMembers[currentRoom].delete(username);
        io.to(currentRoom).emit('room-members', Array.from(roomMembers[currentRoom]));
        socket.to(currentRoom).emit('chat-message', { sender: 'System', text: `${username} left the room.`, time: Date.now() });
      }
    }
    currentRoom = null;
    username = null;
  });

  socket.on('chat-message', (msg) => {
    if (currentRoom && username) {
      io.to(currentRoom).emit('chat-message', { sender: username, text: msg, time: Date.now() });
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    // Clean up friend system data
    if (users[socket.id]) {
      delete userNameToSocket[users[socket.id].userName];
      delete users[socket.id];
    }
    
    // Clean up room data
    if (currentRoom && username) {
      if (roomMembers[currentRoom]) {
        roomMembers[currentRoom].delete(username);
        io.to(currentRoom).emit('room-members', Array.from(roomMembers[currentRoom]));
        socket.to(currentRoom).emit('chat-message', { sender: 'System', text: `${username} disconnected.`, time: Date.now() });
      }
    }
  });
});

// Error handling for uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

server.listen(PORT, () => {
  console.log(`🚀 StudyFlow Server running on port ${PORT}`);
  console.log(`📧 Email service: ${process.env.GMAIL_USER ? 'Configured' : 'Not configured'}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
}); 