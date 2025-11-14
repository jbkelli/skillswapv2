# SkillSwap - Quick Setup Guide

## 🚀 Getting Started in 5 Minutes

### Prerequisites
- Node.js (v16+)
- MongoDB Atlas account (free tier is fine)
- Gmail account

### Step 1: Install Dependencies

**Backend:**
```powershell
cd server
npm install
```

**Frontend:**
```powershell
cd client
npm install
```

### Step 2: Configure Environment

Edit `server/.env`:
```env
PORT=5000
MONGODB_URI=your-mongodb-atlas-connection-string
JWT_SECRET=your-random-secret-key

# Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-gmail-app-password
```

**Get Gmail App Password:**
1. Go to https://myaccount.google.com/security
2. Enable 2-Step Verification
3. Go to https://myaccount.google.com/apppasswords
4. Create app password and use it in EMAIL_PASS

### Step 3: Start Development Servers

**Terminal 1 (Backend):**
```powershell
cd server
npm start
```

**Terminal 2 (Frontend):**
```powershell
cd client
npm run dev
```

### Step 4: Access the App

- Frontend: http://localhost:5173
- Backend: http://localhost:5000

## 📱 First Time Usage

1. **Sign Up**
   - Click "Sign Up"
   - Fill in your details
   - Add skills you have (press Enter after each)
   - Add skills you want to learn
   - Click "Create Account"

2. **Explore Dashboard**
   - See matched users based on skills
   - Use search bar to find specific users
   - Filter by skills using dropdown

3. **Connect with Users**
   - Click "View Profile" to see details
   - Click "Swap Request" to connect
   - Go to "Requests" page to manage

4. **Start Learning**
   - Accept incoming requests
   - Chat with matched users
   - Ask Vally AI for help (bottom-right icon)

## 🎨 Features Overview

### Navigation
- **Home** - Dashboard with matched users
- **Profile** - View/edit your profile
- **Requests** - Manage swap requests
- **Groups** - Coming soon
- **Contact** - Reach the developers

### UI Controls
- **Theme Toggle** - Sun/moon icon in header
- **Power Button** - Logout (top-right)
- **Vally AI** - Chat icon (bottom-right on homepage)
- **Search** - Find users by name/username/bio
- **Filter** - Filter by skills

### Request Flow
1. Browse users → Send request
2. They accept → Chat unlocked
3. Exchange skills → Learn together

## 🔧 Customization

### Update Social Links
Edit `client/src/components/Footer.jsx`:
```javascript
const socialLinks = [
  { icon: LinkedInIcon, url: 'your-linkedin-url', label: 'Your Name' },
  // ... add your links
];
```

### Update Developer Emails
Edit `client/src/pages/ContactPage.jsx` and `server/routes/contact.routes.js`:
```javascript
// Update recipient emails
const recipients = ['your-email@gmail.com', 'team-email@gmail.com'];
```

### Update AI Responses
Edit `server/routes/ai.routes.js`:
```javascript
// Add your OpenAI/Claude API integration here
```

## 🐛 Troubleshooting

### Port Already in Use
```powershell
# Change port in server/.env
PORT=5001
```

### MongoDB Connection Error
- Check MongoDB Atlas IP whitelist (add 0.0.0.0/0 for development)
- Verify connection string includes password
- Ensure cluster is running

### Email Not Sending
- Verify Gmail app password is correct
- Check 2-Step Verification is enabled
- Try regenerating app password

### Socket.io Connection Failed
- Check frontend port in `server/server.js` cors origin
- Default: http://localhost:5173 (Vite default)
- Update if using different port

### Theme Not Persisting
- Check browser localStorage is enabled
- Clear cache and reload

## 📚 Useful Commands

```powershell
# Install all dependencies (from root)
cd client; npm install; cd ../server; npm install

# Run both servers (requires 2 terminals)
# Terminal 1: cd server; npm start
# Terminal 2: cd client; npm run dev

# Check for errors
npm run lint  # in client directory

# Build for production
cd client; npm run build
```

## 🎯 Next Steps

1. Add real users by signing up
2. Complete your profile with bio and skills
3. Send swap requests to connect
4. Test the chat functionality
5. Try the AI chatbot (Vally)
6. Customize social links in footer
7. Set up email configuration
8. Integrate OpenAI/Claude API (optional)

## 💡 Pro Tips

- Add at least 3 skills you have and 3 you want to learn
- Write a good bio - it helps with matching
- Use the search and filter to find specific skills
- Cancel requests you no longer need
- Toggle theme based on your preference
- Contact developers via the Contact page for support

## 🆘 Need Help?

- **Contact Form**: Use the Contact page
- **Email**: 444mwangialvinm@gmail.com or tech.marval.innovations@gmail.com
- **LinkedIn**: Links in footer
- **WhatsApp/Telegram**: Links in footer

---

**Happy Skill Swapping! 🎓**

*Built by Marval Technologies*
