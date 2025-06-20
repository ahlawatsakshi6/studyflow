# 🚀 StudyFlow Deployment Guide

## 📋 Prerequisites

- Node.js 16+ and npm 8+
- Gmail account with App Password
- Git repository
- Hosting platform account (Heroku, Vercel, Railway, etc.)

## 🔧 Environment Setup

### 1. **Gmail Configuration**
1. Go to [Google Account Settings](https://myaccount.google.com/)
2. Enable 2-Factor Authentication
3. Generate App Password for "Mail"
4. Copy the 16-character password

### 2. **Environment Variables**
Create `.env` file in the `server` directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=production

# Gmail Configuration
GMAIL_USER=your-email@gmail.com
GMAIL_PASS=your-16-character-app-password

# CORS Origins (update with your domain)
CORS_ORIGIN=https://your-domain.com
```

## 🌐 Deployment Options

### **Option 1: Heroku Deployment**

1. **Install Heroku CLI**
   ```bash
   npm install -g heroku
   ```

2. **Login to Heroku**
   ```bash
   heroku login
   ```

3. **Create Heroku App**
   ```bash
   heroku create your-studyflow-app
   ```

4. **Set Environment Variables**
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set GMAIL_USER=your-email@gmail.com
   heroku config:set GMAIL_PASS=your-app-password
   heroku config:set CORS_ORIGIN=https://your-app.herokuapp.com
   ```

5. **Deploy**
   ```bash
   git add .
   git commit -m "Deploy StudyFlow"
   git push heroku main
   ```

### **Option 2: Railway Deployment**

1. **Connect Repository**
   - Go to [Railway](https://railway.app/)
   - Connect your GitHub repository

2. **Configure Environment**
   - Add environment variables in Railway dashboard
   - Set `NODE_ENV=production`
   - Add Gmail credentials

3. **Deploy**
   - Railway will automatically deploy on push

### **Option 3: Vercel Deployment**

1. **Build Frontend**
   ```bash
   cd studyflow
   npm run build
   ```

2. **Deploy to Vercel**
   ```bash
   npm install -g vercel
   vercel
   ```

3. **Configure Backend**
   - Deploy server separately (Railway, Heroku, etc.)
   - Update frontend API calls to point to backend URL

## 🔄 Local Development

### **Start Development Server**
```bash
# Terminal 1 - Backend
cd server
npm install
npm run dev

# Terminal 2 - Frontend
cd studyflow
npm install
npm start
```

### **Build for Production**
```bash
# Build frontend
cd studyflow
npm run build

# Start production server
cd server
npm start
```

## 🔒 Security Considerations

### **Production Checklist**
- [ ] Environment variables are set
- [ ] CORS origins are configured
- [ ] Gmail App Password is secure
- [ ] HTTPS is enabled
- [ ] Error handling is in place
- [ ] Rate limiting is configured (optional)

### **Security Best Practices**
1. **Never commit `.env` files**
2. **Use environment variables for secrets**
3. **Enable HTTPS in production**
4. **Configure proper CORS origins**
5. **Implement rate limiting for OTP endpoints**
6. **Use Redis for OTP storage in production**

## 📊 Monitoring

### **Health Check Endpoint**
```
GET /api/health
```

### **Logs**
- Check application logs in your hosting platform
- Monitor for errors and performance issues

## 🛠 Troubleshooting

### **Common Issues**

1. **"Failed to send OTP"**
   - Check Gmail credentials
   - Verify App Password is correct
   - Check server logs

2. **CORS Errors**
   - Update CORS origins in environment variables
   - Ensure frontend URL is included

3. **Socket.IO Connection Issues**
   - Check if server is running
   - Verify WebSocket support on hosting platform

4. **Build Failures**
   - Check Node.js version compatibility
   - Verify all dependencies are installed

### **Debug Commands**
```bash
# Check server status
curl https://your-app.herokuapp.com/api/health

# View logs
heroku logs --tail

# Check environment variables
heroku config
```

## 📈 Performance Optimization

### **Production Optimizations**
1. **Enable compression**
2. **Use CDN for static assets**
3. **Implement caching strategies**
4. **Optimize database queries** (when adding database)
5. **Use Redis for session storage**

### **Monitoring Tools**
- **Application Performance Monitoring**: New Relic, DataDog
- **Error Tracking**: Sentry, Bugsnag
- **Uptime Monitoring**: UptimeRobot, Pingdom

## 🔄 Continuous Deployment

### **GitHub Actions Workflow**
Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy StudyFlow

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '16'
    
    - name: Install Dependencies
      run: |
        cd server && npm install
        cd ../studyflow && npm install
    
    - name: Build Frontend
      run: cd studyflow && npm run build
    
    - name: Deploy to Heroku
      uses: akhileshns/heroku-deploy@v3.12.12
      with:
        heroku_api_key: ${{ secrets.HEROKU_API_KEY }}
        heroku_app_name: "your-app-name"
        heroku_email: "your-email@example.com"
```

## 📞 Support

For deployment issues:
1. Check the troubleshooting section
2. Review hosting platform documentation
3. Check server logs for error messages
4. Verify environment variables are set correctly

---

**🎉 Your StudyFlow application is now ready for deployment!** 