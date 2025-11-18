const express = require('express');
const router = express.Router();
const SwapRequest = require('../models/SwapRequest.model');
const User = require('../models/User.model');
const authMiddleware = require('../middleware/auth.middleware');
const mongoose = require('mongoose');

// Send someone a swap request
router.post('/send', authMiddleware, async (req, res) => {
    try {
        const { receiverId, message } = req.body;

        console.log('=== SWAP REQUEST DEBUG ===');
        console.log('Sender ID:', req.user?.id);
        console.log('Receiver ID:', receiverId);
        console.log('Message:', message);
        console.log('Request body:', req.body);
        console.log('Auth user:', req.user);

        if (!receiverId) {
            console.log('ERROR: Receiver ID is missing');
            return res.status(400).json({ message: 'Receiver ID is required' });
        }

        if (!req.user || !req.user.id) {
            console.log('ERROR: User authentication failed');
            return res.status(401).json({ message: 'Authentication required' });
        }

        // Validate receiver ID format
        if (!mongoose.Types.ObjectId.isValid(receiverId)) {
            console.log('ERROR: Invalid receiver ID format');
            return res.status(400).json({ message: 'Invalid receiver ID format' });
        }

        // Check if receiver exists
        console.log('Checking if receiver exists...');
        const receiverUser = await User.findById(receiverId);
        if (!receiverUser) {
            console.log('ERROR: Receiver user not found');
            return res.status(404).json({ message: 'Receiver user not found' });
        }

        // Don't allow users to send requests to themselves
        if (req.user.id === receiverId) {
            console.log('ERROR: Cannot send request to yourself');
            return res.status(400).json({ message: 'Cannot send swap request to yourself' });
        }

        // Don't allow duplicate pending requests
        console.log('Checking for existing request...');
        const existingRequest = await SwapRequest.findOne({
            sender: req.user.id,
            receiver: receiverId,
            status: 'pending'
        });

        if (existingRequest) {
            console.log('ERROR: Swap request already exists');
            return res.status(400).json({ message: 'Swap request already sent' });
        }

        console.log('Creating new swap request...');
        const newRequest = new SwapRequest({
            sender: req.user.id,
            receiver: receiverId,
            message: message || ''
        });

        console.log('Saving to database...');
        await newRequest.save();

        console.log('SUCCESS: Swap request saved:', newRequest._id);

        res.status(201).json({
            message: 'Swap request sent successfully',
            swapRequest: newRequest
        });
    } catch (err) {
        console.error('=== SWAP REQUEST ERROR ===');
        console.error('Error message:', err.message);
        console.error('Error name:', err.name);
        console.error('Error stack:', err.stack);
        console.error('Full error:', err);
        res.status(500).json({ 
            message: 'Server error sending swap request',
            error: err.message,
            details: process.env.NODE_ENV === 'development' ? err.stack : undefined
        });
    }
});

// Get swap requests you've received from others
router.get('/received', authMiddleware, async (req, res) => {
    try {
        const requests = await SwapRequest.find({ receiver: req.user.id })
            .populate('sender', '-password')
            .sort({ createdAt: -1 });

        res.status(200).json({ requests });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error fetching requests' });
    }
});

// Get swap requests you've sent to others
router.get('/sent', authMiddleware, async (req, res) => {
    try {
        const requests = await SwapRequest.find({ sender: req.user.id })
            .populate('receiver', '-password')
            .sort({ createdAt: -1 });

        res.status(200).json({ requests });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error fetching requests' });
    }
});

// Accept or reject a swap request (receiver only)
router.put('/update/:id', authMiddleware, async (req, res) => {
    try {
        const { status } = req.body;

        if (!['accepted', 'rejected'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const request = await SwapRequest.findById(req.params.id);

        if (!request) {
            return res.status(404).json({ message: 'Swap request not found' });
        }

        // Make sure only the receiver can accept/reject
        if (swapRequest.receiver.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        request.status = status;
        await request.save();

        res.status(200).json({
            message: `Request ${status}`,
            swapRequest: request
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error updating request' });
    }
});

// Cancel a request you sent (sender only)
router.delete('/cancel/:id', authMiddleware, async (req, res) => {
    try {
        const request = await SwapRequest.findById(req.params.id);

        if (!request) {
            return res.status(404).json({ message: 'Swap request not found' });
        }

        // Only the sender can cancel their own request
        if (swapRequest.sender.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        await SwapRequest.findByIdAndDelete(req.params.id);

        res.status(200).json({ message: 'Request cancelled successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error cancelling request' });
    }
});

module.exports = router;
