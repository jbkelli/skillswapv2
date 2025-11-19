const express = require('express');
const router = express.Router();
const Message = require('../models/Message.model');
const authMiddleware = require('../middleware/auth.middleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../uploads/chat');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    },
    fileFilter: (req, file, cb) => {
        // Allow images and common file types
        const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt|zip|mp4|mov/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (extname && mimetype) {
            return cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only images, PDFs, documents, and videos are allowed.'));
        }
    }
});

// Get chat history between two users
router.get('/:userId', authMiddleware, async (req, res) => {
    try {
        const { userId } = req.params;
        
        const messages = await Message.find({
            $or: [
                { sender: req.user.id, receiver: userId },
                { sender: userId, receiver: req.user.id }
            ]
        })
        .sort({ createdAt: 1 })
        .populate('sender', 'firstName lastName username')
        .populate('receiver', 'firstName lastName username');

        res.status(200).json({ messages });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error fetching messages' });
    }
});

// Save a new message
router.post('/send', authMiddleware, async (req, res) => {
    try {
        const { receiverId, message } = req.body;

        const newMessage = new Message({
            sender: req.user.id,
            receiver: receiverId,
            message,
            messageType: 'text'
        });

        await newMessage.save();

        const populatedMessage = await Message.findById(newMessage._id)
            .populate('sender', 'firstName lastName username')
            .populate('receiver', 'firstName lastName username');

        res.status(201).json({ 
            message: 'Message sent',
            data: populatedMessage 
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error sending message' });
    }
});

// Upload and send file/image
router.post('/send-file', authMiddleware, upload.single('file'), async (req, res) => {
    try {
        const { receiverId, message } = req.body;

        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        // Determine message type based on file
        const isImage = /\.(jpg|jpeg|png|gif)$/i.test(req.file.originalname);
        const messageType = isImage ? 'image' : 'file';

        const newMessage = new Message({
            sender: req.user.id,
            receiver: receiverId,
            message: message || '',
            messageType: messageType,
            fileUrl: `/uploads/chat/${req.file.filename}`,
            fileName: req.file.originalname,
            fileSize: req.file.size
        });

        await newMessage.save();

        const populatedMessage = await Message.findById(newMessage._id)
            .populate('sender', 'firstName lastName username')
            .populate('receiver', 'firstName lastName username');

        res.status(201).json({ 
            message: 'File sent successfully',
            data: populatedMessage 
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error sending file' });
    }
});

// Mark messages as read
router.put('/read/:userId', authMiddleware, async (req, res) => {
    try {
        const { userId } = req.params;

        await Message.updateMany(
            { sender: userId, receiver: req.user.id, read: false },
            { read: true }
        );

        res.status(200).json({ message: 'Messages marked as read' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error marking messages as read' });
    }
});

// Get unread message count
router.get('/unread/count', authMiddleware, async (req, res) => {
    try {
        const unreadCount = await Message.countDocuments({
            receiver: req.user.id,
            read: false
        });

        res.status(200).json({ count: unreadCount });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error getting unread count' });
    }
});

module.exports = router;
