const express = require('express');
const router = express.Router();
const Message = require('../models/Message.model');
const authMiddleware = require('../middleware/auth.middleware');

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
            message
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
