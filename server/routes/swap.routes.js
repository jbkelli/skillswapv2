const express = require('express');
const router = express.Router();
const SwapRequest = require('../models/SwapRequest.model');
const authMiddleware = require('../middleware/auth.middleware');

// Send a swap request
router.post('/send', authMiddleware, async (req, res) => {
    try {
        const { receiverId, message } = req.body;

        console.log('Swap request received:', { senderId: req.user.id, receiverId, message });

        if (!receiverId) {
            return res.status(400).json({ message: 'Receiver ID is required' });
        }

        // Check if request already exists
        const existingRequest = await SwapRequest.findOne({
            sender: req.user.id,
            receiver: receiverId,
            status: 'pending'
        });

        if (existingRequest) {
            return res.status(400).json({ message: 'Swap request already sent' });
        }

        const newRequest = new SwapRequest({
            sender: req.user.id,
            receiver: receiverId,
            message: message || ''
        });

        await newRequest.save();

        console.log('Swap request saved successfully:', newRequest);

        res.status(201).json({
            message: 'Swap request sent successfully',
            swapRequest: newRequest
        });
    } catch (err) {
        console.error('Error sending swap request:', err);
        console.error('Error stack:', err.stack);
        res.status(500).json({ 
            message: 'Server error sending swap request',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
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
