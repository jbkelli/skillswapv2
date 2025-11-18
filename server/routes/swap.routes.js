const express = require('express');
const router = express.Router();
const SwapRequest = require('../models/SwapRequest.model');
const authMiddleware = require('../middleware/auth.middleware');

// Send a swap request
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

        // Check if request already exists
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
        res.status(500).json({ 
            message: 'Server error sending swap request',
            error: err.message
        });
    }
});

// Get received swap requests
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

// Get sent swap requests
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

// Update swap request status (accept/reject)
router.put('/:id', authMiddleware, async (req, res) => {
    try {
        const { status } = req.body;

        if (!['accepted', 'rejected'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const request = await SwapRequest.findById(req.params.id);

        if (!request) {
            return res.status(404).json({ message: 'Request not found' });
        }

        // Only receiver can update the request
        if (request.receiver.toString() !== req.user.id) {
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

// Cancel swap request (sender only)
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const request = await SwapRequest.findById(req.params.id);

        if (!request) {
            return res.status(404).json({ message: 'Request not found' });
        }

        // Only sender can cancel the request
        if (request.sender.toString() !== req.user.id) {
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
