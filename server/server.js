require('dotenv').config();//loading .env file contents
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const http = require('http');
const { Server } = require('socket.io');

//importing the routes
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const swapRoutes = require('./routes/swap.routes');
const chatRoutes = require('./routes/chat.routes');
const contactRoutes = require('./routes/contact.routes');
const aiRoutes = require('./routes/ai.routes');

//creating the express app
const app = express();
const server = http.createServer(app);

// Allowed origins for CORS
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:3000',
    process.env.CLIENT_URL, // Your deployed frontend URL
].filter(Boolean); // Remove undefined values

// Setup Socket.io with CORS
const io = new Server(server, {
    cors: {
        origin: allowedOrigins,
        methods: ["GET", "POST"],
        credentials: true
    }
});

//middleware of the app
app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (mobile apps, Postman, etc.)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));
app.use(express.json()); //allow our app to accept json format

// Make io accessible in routes
app.set('io', io);

//Use routes imported
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/swap', swapRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/ai', aiRoutes);

//Testing the server
app.get('/', (req, res) => {
    res.json({
        message: "Welcome to Skill Swap API!"
    });
});

const PORT = process.env.PORT || 5000;

//Get the connection string
const uri = process.env.MONGODB_URI;

//connect to mongoDB
mongoose.connect(uri)
    .then(() => {
        console.log('Connected to MongoDB⚡ ');
        console.log('Database:', mongoose.connection.name);

        //start the server after DB is connected
        server.listen(PORT, () => {
            console.log(`Server is running on port✔ ${PORT}`);
        });
    })
    .catch((err) => {
        console.error('Database connection error:❌ ', err.message)
    })

// Socket.io connection handling
const connectedUsers = new Map();

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // User joins with their ID
    socket.on('join', (userId) => {
        connectedUsers.set(userId, socket.id);
        console.log(`User ${userId} joined with socket ${socket.id}`);
    });

    // Handle private messages
    socket.on('send_message', ({ senderId, receiverId, message }) => {
        const receiverSocketId = connectedUsers.get(receiverId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit('receive_message', {
                senderId,
                message,
                timestamp: new Date()
            });
        }
    });

    // Handle typing indicator
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

    // User disconnects
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        // Remove from connected users
        for (const [userId, socketId] of connectedUsers.entries()) {
            if (socketId === socket.id) {
                connectedUsers.delete(userId);
                break;
            }
        }
    });
});
