# 📚 StudyFlow - Your Study Companion

A comprehensive study management application with real-time collaboration features, email verification, and productivity tools.

## ✨ Features

### 🎯 **Core Features**
- **Dashboard** - Overview of study progress and daily tasks
- **Study Calendar** - Schedule and manage study sessions
- **Pomodoro Timer** - Focused study sessions with timer
- **Subjects Management** - Organize topics and track progress
- **Progress Tracking** - Visual charts and analytics
- **Study Notes** - Create and organize notes by subject
- **Goals & Tasks** - Set weekly goals and daily tasks
- **Habits Tracker** - Build consistent study habits
- **Online Study Rooms** - Real-time collaboration with friends

### 🔐 **Authentication & Security**
- **User Registration/Login** - Secure user accounts
- **Email Verification** - OTP-based email verification
- **Profile Management** - Customizable avatars and settings
- **Dark Mode** - Toggle between light and dark themes

### 🌐 **Real-time Features**
- **Study Rooms** - Join subject-specific study groups
- **Live Chat** - Communicate with study partners
- **Friend System** - Add and manage study friends
- **Online Status** - See who's currently studying

## 🚀 Quick Start

### **Prerequisites**
- Node.js 16+ and npm 8+
- Gmail account with App Password

### **Local Development**

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd studyflow
   ```

2. **Install dependencies**
   ```bash
   # Install server dependencies
   cd server
   npm install
   
   # Install frontend dependencies
   cd ../studyflow
   npm install
   ```

3. **Configure environment variables**
   ```bash
   # In server directory, create .env file
   GMAIL_USER=your-email@gmail.com
   GMAIL_PASS=your-app-password
   PORT=5000
   ```

4. **Start the application**
   ```bash
   # Terminal 1 - Start backend server
   cd server
   npm run dev
   
   # Terminal 2 - Start frontend
   cd studyflow
   npm start
   ```

5. **Open your browser**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## 🏗 Project Structure

```
studyflow/
├── server/                 # Backend server
│   ├── index.js           # Main server file
│   ├── package.json       # Server dependencies
│   └── .env              # Environment variables
├── studyflow/             # Frontend React app
│   ├── src/
│   │   ├── App.js        # Main application component
│   │   ├── App.css       # Styles
│   │   └── index.js      # Entry point
│   ├── public/           # Static assets
│   └── package.json      # Frontend dependencies
├── Procfile              # Heroku deployment
├── .gitignore           # Git ignore rules
└── DEPLOYMENT.md        # Deployment guide
```

## 🔧 Configuration

### **Environment Variables**

Create a `.env` file in the `server` directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Gmail Configuration (for email verification)
GMAIL_USER=your-email@gmail.com
GMAIL_PASS=your-app-password

# CORS Origins
CORS_ORIGIN=http://localhost:3000
```

### **Gmail Setup**

1. Go to [Google Account Settings](https://myaccount.google.com/)
2. Enable 2-Factor Authentication
3. Generate App Password for "Mail"
4. Use the 16-character password in your `.env` file

## 📱 Usage

### **Getting Started**
1. **Register** with username, password, and Gmail
2. **Verify your email** using the OTP sent to your Gmail
3. **Customize your profile** with avatar and accent color
4. **Start organizing** your study materials

### **Key Features**

#### **Dashboard**
- View study overview and daily progress
- Check completed tasks and active subjects
- Monitor study streak and achievements

#### **Study Calendar**
- Schedule study sessions with subjects and topics
- Mark sessions as completed
- Organize by tags and subjects

#### **Subjects Management**
- Create subjects with custom colors
- Add topics within each subject
- Track completion progress

#### **Online Study Rooms**
- Join or create study rooms
- Chat with study partners in real-time
- Add friends and collaborate

## 🛠 Development

### **Available Scripts**

#### **Backend (server/)**
```bash
npm start          # Start production server
npm run dev        # Start development server with nodemon
npm test           # Run tests
```

#### **Frontend (studyflow/)**
```bash
npm start          # Start development server
npm run build      # Build for production
npm test           # Run tests
npm run eject      # Eject from Create React App
```

### **API Endpoints**

#### **Authentication**
- `POST /api/send-otp` - Send email verification OTP
- `POST /api/verify-otp` - Verify OTP

#### **Health Check**
- `GET /api/health` - Server health status

### **Socket.IO Events**

#### **User Management**
- `register` - Register user for friend system
- `sendFriendRequest` - Send friend request
- `acceptFriendRequest` - Accept friend request
- `rejectFriendRequest` - Reject friend request

#### **Study Rooms**
- `join-room` - Join a study room
- `leave-room` - Leave a study room
- `chat-message` - Send chat message

## 🚀 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

### **Quick Deploy Options**

#### **Heroku**
```bash
heroku create your-studyflow-app
heroku config:set NODE_ENV=production
heroku config:set GMAIL_USER=your-email@gmail.com
heroku config:set GMAIL_PASS=your-app-password
git push heroku main
```

#### **Railway**
1. Connect your GitHub repository
2. Add environment variables
3. Deploy automatically

#### **Vercel**
```bash
npm install -g vercel
vercel
```

## 🔒 Security

### **Implemented Security Features**
- ✅ Environment variable protection
- ✅ CORS configuration
- ✅ Input validation
- ✅ Error handling
- ✅ OTP expiration (10 minutes)
- ✅ Rate limiting for OTP attempts

### **Best Practices**
- Never commit `.env` files
- Use HTTPS in production
- Regularly update dependencies
- Monitor application logs

## 🐛 Troubleshooting

### **Common Issues**

1. **"Failed to send OTP"**
   - Check Gmail credentials in `.env`
   - Verify App Password is correct
   - Check server logs for errors

2. **Socket.IO Connection Issues**
   - Ensure server is running on port 5000
   - Check CORS configuration
   - Verify WebSocket support

3. **Build Errors**
   - Check Node.js version (16+)
   - Clear npm cache: `npm cache clean --force`
   - Delete node_modules and reinstall

### **Debug Commands**
```bash
# Check server status
curl http://localhost:5000/api/health

# View server logs
cd server && npm run dev

# Check environment variables
echo $GMAIL_USER
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **React** - Frontend framework
- **Socket.IO** - Real-time communication
- **Chart.js** - Data visualization
- **React Icons** - Icon library
- **Nodemailer** - Email functionality

## 📞 Support

For support and questions:
- Check the troubleshooting section
- Review the deployment guide
- Open an issue on GitHub

---

**🎉 Happy Studying with StudyFlow!** 