# SkillSwap - Smart Skill Exchange Platform 🔄

A modern MERN stack application that connects people worldwide for intelligent skill exchanges. Learn from others while teaching what you know - powered by AI assistance and real-time communication.

## 🌐 Live Demo

- **Frontend**: [https://skillswappie.vercel.app](https://skillswappie.vercel.app)
- **Backend API**: [https://skillswapv2.onrender.com](https://skillswapv2.onrender.com)

## 🌟 Key Features

### 1. **User Authentication & Profiles**
   - Secure JWT-based authentication
   - Comprehensive user profiles with:
     - Skills I have & skills I want to learn
     - Bio, location (300+ global locations), contact info
     - Profile picture upload with automatic compression
     - Social media links (LinkedIn, GitHub, Twitter)

### 2. **Smart Discovery & Matching**
   - **Your Swappies**: View all your accepted connections
   - **Discover Swappies**: Browse all users with intelligent matching
   - Smart algorithm that prioritizes skill compatibility:
     - What they have that you want
     - What you have that they want
   - Search by name, username, or bio
   - Filter by specific skills
   - Visual match indicators

### 3. **Swap Request System**
   - Send skill-swap requests with custom messages
   - View received and sent requests
   - Accept, reject, or cancel requests
   - Real-time status tracking (pending, accepted, rejected)
   - Automatic notifications

### 4. **Real-Time Chat**
   - Socket.io powered messaging
   - One-on-one conversations with swap partners
   - Message history persistence
   - Typing indicators
   - WhatsApp-style date separators (Today, Yesterday, dates)
   - Read receipts

### 5. **Vally - AI Assistant** 🤖
   - Built with Google Gemini AI (2.5 Flash Lite)
   - Two modes:
     - **General Chat**: Ask Vally anything about SkillSwap
     - **Email Generator**: AI-powered cold email creation
   - Inline chat support: Type `@vally` in any conversation
   - Context-aware responses about platform features
   - Available on floating chatbot widget

### 6. **Contact & Support**
   - Email integration via Nodemailer
   - Direct contact form
   - Social media links
   - Team information

### 7. **Global Location Database**
   - 300+ locations covering:
     - Kenya (all 47 counties)
     - USA (all 50 states)
     - Canada (all provinces/territories)
     - UK, Australia, India
     - Major cities across Africa, Europe, Asia, Latin America
   - Remote/Online option

## 📁 Project Structure

```
SkillSwap/
├── client/                     # React frontend (Vite)
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   │   ├── AIChatbot.jsx          # Vally AI assistant widget
│   │   │   ├── AuthInput.jsx          # Styled input fields
│   │   │   ├── Footer.jsx             # Footer component
│   │   │   ├── Header.jsx             # Navigation header
│   │   │   ├── LoginForm.jsx          # Login form
│   │   │   ├── NeuralBackground.jsx   # Animated background
│   │   │   ├── Notification.jsx       # Toast notifications
│   │   │   ├── SignupForm.jsx         # Signup form
│   │   │   └── SkillInput.jsx         # Tag-based skill input
│   │   ├── pages/              # Page components
│   │   │   ├── AuthPage.jsx           # Login/Signup page
│   │   │   ├── ChatPage.jsx           # Real-time messaging
│   │   │   ├── ContactPage.jsx        # Contact form
│   │   │   ├── HomePage.jsx           # Dashboard/Discovery
│   │   │   ├── ProfilePage.jsx        # User profile
│   │   │   ├── RequestsPage.jsx       # Swap requests
│   │   │   └── UserProfilePage.jsx    # View other profiles
│   │   ├── context/            # State management
│   │   │   ├── AuthContext.jsx        # Auth state
│   │   │   ├── NotificationContext.jsx # Notifications
│   │   │   └── ThemeContext.jsx       # Theme state
│   │   ├── services/           # API services
│   │   │   ├── api.js                 # Axios instance
│   │   │   └── index.js               # Service exports
│   │   ├── data/               # Static data
│   │   │   └── locations.js           # Global locations
│   │   ├── config/             # Configuration
│   │   │   └── api.js                 # API endpoints
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
│
└── server/                     # Express backend
    ├── models/                 # MongoDB schemas
    │   ├── User.model.js              # User schema
    │   ├── SwapRequest.model.js       # Swap request schema
    │   └── Message.model.js           # Chat message schema
    ├── routes/                 # API routes
    │   ├── ai.routes.js               # Vally AI endpoints
    │   ├── auth.routes.js             # Authentication
    │   ├── chat.routes.js             # Messaging
    │   ├── contact.routes.js          # Contact form
    │   ├── swap.routes.js             # Swap requests
    │   └── user.routes.js             # User management
    ├── middleware/             # Custom middleware
    │   └── auth.middleware.js         # JWT verification
    ├── service/                # Business logic
    │   └── emailGenerator.js          # AI email generation
    ├── scripts/                # Utility scripts
    │   ├── cleanDatabase.js           # DB cleanup
    │   └── fixSwapRequestIndexes.js   # Index repair
    ├── server.js               # Main server file
    ├── .env                    # Environment variables
    └── package.json
```

## 🛠 Tech Stack

### Frontend
- **React 18** - UI library
- **Vite** - Build tool & dev server
- **React Router v6** - Client-side routing
- **Socket.io Client** - Real-time communication
- **Axios** - HTTP client
- **Tailwind CSS** - Utility-first styling
- **Context API** - State management

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM for MongoDB
- **Socket.io** - WebSocket server
- **JWT** - Authentication tokens
- **bcrypt** - Password hashing
- **Nodemailer** - Email sending
- **Google Generative AI** - Vally AI assistant

### Deployment
- **Frontend**: Vercel
- **Backend**: Render
- **Database**: MongoDB Atlas

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB Atlas account
- npm or yarn
- Google Gemini API key (for AI features)
- Gmail account with App Password (for email features)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/jbkelli/skillswapv2.git
cd SkillSwap
```

2. **Setup Backend**
```bash
cd server
npm install
```

Create a `.env` file in the `server` directory:
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Connection
MONGODB_URI=your_mongodb_atlas_connection_string

# JWT Secret (use a strong random string)
JWT_SECRET=your_super_secret_jwt_key_change_this

# Email Configuration (Gmail)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password

# Google Gemini AI
GEMINI_API_KEY=your_gemini_api_key

# Frontend URL (for CORS)
CLIENT_URL=http://localhost:5173
```

3. **Setup Frontend**
```bash
cd ../client
npm install
```

Create a `.env` file in the `client` directory:
```env
# API Configuration
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

4. **Run the Application**

Start the backend server:
```bash
cd server
npm run dev
```

Start the frontend (in a new terminal):
```bash
cd client
npm run dev
```

The app will be available at:
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5000`

## 🔑 Environment Variables Explained

### Backend (`server/.env`)

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Server port number | Yes |
| `MONGODB_URI` | MongoDB Atlas connection string | Yes |
| `JWT_SECRET` | Secret key for JWT tokens | Yes |
| `EMAIL_USER` | Gmail account for sending emails | Yes |
| `EMAIL_PASS` | Gmail App Password (not regular password) | Yes |
| `GEMINI_API_KEY` | Google Gemini API key for Vally AI | Yes |
| `CLIENT_URL` | Frontend URL for CORS | Yes |

### Frontend (`client/.env`)

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_API_URL` | Backend API base URL | Yes |
| `VITE_SOCKET_URL` | Backend WebSocket URL | Yes |

## 📝 API Documentation

### Authentication Endpoints
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user

### User Endpoints
- `GET /api/users/all` - Get all users (protected)
- `GET /api/users/:id` - Get user by ID (protected)
- `GET /api/users/profile/me` - Get current user profile (protected)
- `PUT /api/users/profile/update` - Update profile (protected)

### Swap Request Endpoints
- `POST /api/swap/send` - Send swap request (protected)
- `GET /api/swap/received` - Get received requests (protected)
- `GET /api/swap/sent` - Get sent requests (protected)
- `PUT /api/swap/update/:id` - Update request status (protected)
- `DELETE /api/swap/cancel/:id` - Cancel request (protected)

### Chat Endpoints
- `GET /api/chat/:userId` - Get chat history (protected)
- `POST /api/chat/send` - Send message (protected)
- `PUT /api/chat/read/:userId` - Mark messages as read (protected)

### AI Endpoints
- `POST /api/ai/chat` - Chat with Vally (protected)
- `POST /api/ai/generate-email` - Generate cold email (protected)

### Contact Endpoint
- `POST /api/contact/send` - Send contact form email

## 🌐 Deployment

### Production Deployment

**Frontend (Vercel)**
1. Push code to GitHub
2. Connect repository to Vercel
3. Set environment variables in Vercel dashboard:
   - `VITE_API_URL=https://skillswapv2.onrender.com/api`
   - `VITE_SOCKET_URL=https://skillswapv2.onrender.com`
4. Deploy automatically on push

**Backend (Render)**
1. Connect repository to Render
2. Set environment variables in Render dashboard:
   - `MONGODB_URI` - Your MongoDB Atlas connection string
   - `JWT_SECRET` - Strong secret key
   - `EMAIL_USER` - Gmail address
   - `EMAIL_PASS` - Gmail app password
   - `GEMINI_API_KEY` - Google Gemini API key
   - `CLIENT_URL=https://skillswappie.vercel.app`
3. Deploy automatically on push to main branch

**MongoDB Atlas**
1. Create a cluster
2. Add database user
3. Whitelist Render's IP addresses (or use 0.0.0.0/0 for all)
4. Copy connection string

## 🎨 Features in Detail

### Vally AI Assistant
Vally uses Google's Gemini 2.5 Flash Lite model to provide:
- Contextual help about SkillSwap features
- Skill exchange guidance
- Cold email generation for networking
- Inline chat support with `@vally` command

### Real-Time Communication
- Socket.io handles WebSocket connections
- Automatic reconnection on network issues
- Typing indicators show when someone is composing
- Read receipts for delivered messages
- Date grouping for better chat organization

### Smart Matching Algorithm
The platform prioritizes connections based on:
1. **Skill Compatibility**: Users who have what you want and want what you have
2. **Mutual Interest**: Bidirectional skill exchange potential
3. **Score Calculation**: 10 points per matching skill

## 🛡️ Security Features

- JWT token-based authentication
- Password hashing with bcrypt (10 rounds)
- Protected API routes with auth middleware
- CORS configuration for production
- Input validation and sanitization
- MongoDB injection prevention with Mongoose
- Environment variable protection

## 📱 Responsive Design

- Mobile-first approach
- Tailwind CSS responsive utilities
- Touch-friendly UI elements
- Optimized for all screen sizes

## 🐛 Troubleshooting

### Common Issues

**Swap request fails with 500 error**
- Solution: Run the index fix script in `server/scripts/fixSwapRequestIndexes.js`
- This cleans up old database indexes from previous schemas

**Email not sending**
- Ensure Gmail account has 2FA enabled
- Use App Password, not regular password
- Check EMAIL_USER and EMAIL_PASS in .env

**Socket.io connection fails**
- Verify VITE_SOCKET_URL matches backend URL
- Check CORS configuration in server.js
- Ensure CLIENT_URL environment variable is set

**Images not uploading**
- Check file size (max 5MB)
- Ensure file is jpg, jpeg, or png format
- Images are compressed to max 800x800px

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👥 Team

**Marval Innovations**
- Email: tech.marval.innovations@gmail.com
- Location: Nairobi, Kenya

## 🙏 Acknowledgments

- Google Gemini for AI capabilities
- Socket.io for real-time features
- MongoDB for flexible data storage
- Vercel and Render for hosting

## 📞 Support

For support, email tech.marval.innovations@gmail.com or use the contact form on the live site.

---

Made with ❤️ by the SkillSwap Team
vercel
```

3. Set environment variables in Vercel dashboard:
   - `MONGODB_URI` - Your MongoDB connection string
   - `JWT_SECRET` - Your JWT secret key
   - `EMAIL_USER` - Email for contact form
   - `EMAIL_PASS` - Email app password
   - `CLIENT_URL` - Your frontend URL
   - `NODE_ENV=production`

#### Frontend Deployment

1. Create `.env.local` in client directory:
```env
VITE_API_URL=https://your-backend.vercel.app
VITE_SOCKET_URL=https://your-backend.vercel.app
```

2. Deploy frontend:
```bash
cd client
vercel
```

### Alternative Deployment Options

- **Frontend**: Netlify, Render, GitHub Pages
- **Backend**: Railway, Render, Heroku
- **Database**: MongoDB Atlas (recommended)

### Important Files for Deployment

- `.gitignore` - Excludes node_modules, .env, build files
- `client/vercel.json` - SPA routing configuration
- `server/vercel.json` - Serverless function configuration
- `.env.example` files - Template for environment variables

## 📡 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user

### Users
- `GET /api/users/all` - Get all users (protected)
- `GET /api/users/:id` - Get user by ID (protected)
- `GET /api/users/profile/me` - Get current user profile (protected)
- `PUT /api/users/profile/update` - Update profile (protected)

### Swap Requests
- `POST /api/swap/send` - Send swap request (protected)
- `GET /api/swap/received` - Get received requests (protected)
- `GET /api/swap/sent` - Get sent requests (protected)
- `PUT /api/swap/:id` - Update request status (protected)

## 🎨 UI Features

- **Dark Theme** - Sleek gray-950 background with blue accents
- **Animated Auth Page** - Sliding panel design for login/signup
- **Responsive Design** - Mobile-first approach
- **Smooth Transitions** - CSS animations throughout
- **Tag Input System** - Visual skill management

## 🔐 Security

- Passwords hashed with bcrypt (salt rounds: 10)
- JWT tokens with 3-day expiration
- Protected API routes with middleware
- Input validation on frontend and backend

## 📝 User Model Schema

```javascript
{
  firstName: String (required),
  lastName: String (required),
  username: String (required, unique),
  email: String (required, unique),
  password: String (hashed, required),
  skillsHave: Array of Strings,
  skillsWant: Array of Strings,
  bio: String (max 500 chars),
  profilePic: String (URL),
  location: String,
  contacts: {
    phone: String,
    linkedin: String,
    github: String,
    twitter: String
  },
  timestamps: true
}
```

## 🔄 Matching Algorithm

Currently implements a simple scoring system:
- +10 points if user has a skill you want
- +10 points if user wants a skill you have
- Users sorted by total score (highest first)

**Future Enhancement**: AI-powered contextual matching using NLP to understand skill relationships.

## 🎯 Roadmap

### Phase 1 ✅ (Current)
- [x] User authentication
- [x] Skills management
- [x] Basic matching
- [x] Swap requests (backend)

### Phase 2 🔨 (Next)
- [ ] Profile pages (view/edit)
- [ ] Swap request UI
- [ ] Request notifications
- [ ] User search/filter

### Phase 3 🚀 (Future)
- [ ] AI-powered matching
- [ ] Socket.io real-time chat
- [ ] AI chat mediator
- [ ] Learning plans
- [ ] Groups feature
- [ ] File sharing
- [ ] Video calls integration

## 👥 Contributing

This is a learning project. Feel free to fork and experiment!

## 📄 License

MIT

## 🙏 Acknowledgments

Built as part of PLP Academy MERN stack training.

---

**Happy Skill Swapping! 🚀**
