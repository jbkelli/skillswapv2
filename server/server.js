require('dotenv').config(); // Load environment variables
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const http = require('http');
const { Server } = require('socket.io');

// Import all our route handlers
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const swapRoutes = require('./routes/swap.routes');
const chatRoutes = require('./routes/chat.routes');
const contactRoutes = require('./routes/contact.routes');
const aiRoutes = require('./routes/ai.routes');

// Create the Express app and HTTP server
const app = express();
const server = http.createServer(app);

// List of allowed origins for CORS - keeps our app secure
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:3000',
    'https://skillswappie.vercel.app',
    process.env.CLIENT_URL, // Your deployed frontend URL
].filter(Boolean); // Remove undefined values

console.log('Allowed CORS origins:', allowedOrigins);

// Set up Socket.io for real-time chat with CORS enabled
const io = new Server(server, {
    cors: {
        origin: allowedOrigins,
        methods: ["GET", "POST"],
        credentials: true
    }
});

// Middleware setup
app.use(cors({
    origin: function (origin, callback) {
        console.log('CORS check - Origin:', origin);
        // Let requests with no origin through (like mobile apps or Postman)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.indexOf(origin) !== -1) {
            console.log('CORS allowed for:', origin);
            callback(null, true);
        } else {
            console.log('CORS blocked for:', origin);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));
app.use(express.json({ limit: '10mb' })); // Accept JSON up to 10MB (for profile images)
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

// Make Socket.io available in our routes
app.set('io', io);

// Hook up all the routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/swap', swapRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/ai', aiRoutes);

// Basic health check endpoint
app.get('/', (req, res) => {
    res.json({
        message: "Welcome to Skill Swap API!"
    });
});

const PORT = process.env.PORT || 5000;

// Get MongoDB connection string from environment
const uri = process.env.MONGODB_URI;

// Connect to MongoDB
mongoose.connect(uri)
    .then(async () => {
        console.log('Connected to MongoDB⚡ ');
        console.log('Database:', mongoose.connection.name);

        // Fix old indexes on startup (one-time fix for production)
        try {
            const db = mongoose.connection.db;
            const collection = db.collection('swaprequests');
            
            // Try to drop the old index if it exists
            try {
                await collection.dropIndex('fromUser_1_toUser_1');
                console.log('✅ Dropped old fromUser_1_toUser_1 index');
            } catch (err) {
                // Index doesn't exist, that's fine
                if (err.code !== 27 && !err.message.includes('index not found')) {
                    console.log('Note: Old index already removed or never existed');
                }
            }
        } catch (err) {
            console.log('Index cleanup check completed');
        }

        // Start the server once database is ready
        server.listen(PORT, () => {
            console.log(`Server is running on port✔ ${PORT}`);
        });
    })
    .catch((err) => {
        console.error('Database connection error:❌ ', err.message)
    })

// Handle Socket.io connections for real-time chat
const connectedUsers = new Map();
const User = require('./models/User.model');

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // When a user joins, store their socket ID
    socket.on('join', (userId) => {
        connectedUsers.set(userId, socket.id);
        console.log(`User ${userId} joined with socket ${socket.id}`);
    });

    // Send private messages between users
    socket.on('send_message', async ({ senderId, receiverId, message }) => {
        const receiverSocketId = connectedUsers.get(receiverId);
        if (receiverSocketId) {
            // Fetch sender info for notification
            let senderName = 'Someone';
            try {
                const sender = await User.findById(senderId).select('firstName lastName');
                if (sender) {
                    senderName = `${sender.firstName} ${sender.lastName}`;
                }
            } catch (err) {
                console.error('Error fetching sender info:', err);
            }

            io.to(receiverSocketId).emit('receive_message', {
                senderId,
                senderName,
                message,
                timestamp: new Date()
            });
        }
    });

    // Show typing indicator to the other person
    socket.on('typing', ({ senderId, receiverId }) => {
        const receiverSocketId = connectedUsers.get(receiverId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit('user_typing', { senderId });
        }
    });

    socket.on('stop_typing', ({ senderId, receiverId }) => {
        const receiverSocketId = connectedUsers.get(receiverId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit('user_stop_typing', { senderId });
        }
    });

    // Clean up when user disconnects
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        // Remove them from the active users map
        for (const [userId, socketId] of connectedUsers.entries()) {
            if (socketId === socket.id) {
                connectedUsers.delete(userId);
                break;
            }
        }
    });
});
