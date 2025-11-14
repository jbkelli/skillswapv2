# SkillSwap - Smart Skill-Bartering Platform

A modern MERN stack application that connects tech enthusiasts for intelligent skill exchanges, powered by AI matching and real-time communication.

## 🌟 Features

### Currently Implemented ✅

1. **Authentication System**
   - Secure signup with firstName, lastName, username, email, password
   - JWT-based authentication
   - Protected routes

2. **Skills Management**
   - Tag-based skill input (press Enter to add)
   - "Skills I Have" tracking
   - "Skills I Want to Learn" tracking

3. **Smart Matching Dashboard**
   - View all users in the network
   - Basic matching algorithm that prioritizes users based on:
     - Skills they have that you want
     - Skills you have that they want
   - User cards with profile summaries

4. **Swap Request System** (Backend Ready)
   - Send swap requests to other users
   - Accept/reject incoming requests
   - Track request status (pending, accepted, rejected)

5. **Real-Time Chat**
   - Socket.io integration
   - Private messaging between matched users
   - Message history and online status

6. **AI Chatbot Assistant (Vally)**
   - Context-aware responses
   - Platform navigation help
   - Skill-swapping guidance
   - Available on all pages

7. **Profile Management**
   - View and edit user profiles
   - Profile picture upload (URL or local file)
   - Bio, location, and contact info
   - Skills management

8. **Contact Form**
   - Email integration with nodemailer
   - Social media links
   - Direct communication

9. **Theme System**
   - Light and dark mode toggle
   - Persistent theme preference
   - Smooth transitions
   - Learning plan generation

## 📁 Project Structure

```
SkillSwap/
├── client/                 # React frontend (Vite)
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   │   ├── AuthInput.jsx
│   │   │   ├── LoginForm.jsx
│   │   │   ├── SignupForm.jsx
│   │   │   └── SkillInput.jsx
│   │   ├── pages/         # Page components
│   │   │   ├── AuthPage.jsx
│   │   │   ├── HomePage.jsx
│   │   │   └── GroupsPage.jsx
│   │   ├── context/       # React Context (State Management)
│   │   │   └── AuthContext.jsx
│   │   ├── services/      # API services
│   │   │   ├── api.js
│   │   │   └── index.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
│
└── server/                # Express backend
    ├── models/            # MongoDB schemas
    │   ├── User.model.js
    │   └── SwapRequest.model.js
    ├── routes/            # API routes
    │   ├── auth.routes.js
    │   ├── user.routes.js
    │   └── swap.routes.js
    ├── middleware/        # Custom middleware
    │   └── auth.middleware.js
    ├── server.js          # Main server file
    ├── .env               # Environment variables
    └── package.json
```

## 🛠 Tech Stack

### Frontend
- **React 19** - UI library
- **Vite** - Build tool
- **React Router DOM** - Routing
- **Tailwind CSS v4** - Styling
- **Axios** - HTTP client

### Backend
- **Node.js & Express** - Server
- **MongoDB & Mongoose** - Database
- **JWT** - Authentication
- **bcrypt** - Password hashing

### Planned Additions
- **Socket.io** - Real-time communication
- **OpenAI/Claude API** - AI agent integration

## 🚀 Getting Started

### Prerequisites
- Node.js (v16+)
- MongoDB Atlas account (or local MongoDB)
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd SkillSwap
```

2. **Setup Backend**
```bash
cd server
npm install
```

Create a `.env` file in the `server` directory:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_jwt_key
```

3. **Setup Frontend**
```bash
cd client
npm install
```

### Running the Application

1. **Start Backend** (from `server` directory)
```bash
npm start
```
Server runs on http://localhost:5000

2. **Start Frontend** (from `client` directory)
```bash
npm run dev
```
Frontend runs on http://localhost:5173

## 🌐 Deployment

### Deploy to Vercel

#### Backend Deployment

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Navigate to server directory and deploy:
```bash
cd server
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
