const express = require('express');
const router = express.Router();
const User = require('../models/User.model');
const authMiddleware = require('../middleware/auth.middleware');

// Get all users (for homepage matching)
router.get('/all', authMiddleware, async (req, res) => {
    try {
        // Get all users except the current user, excluding password
        const users = await User.find({ _id: { $ne: req.user.id } })
            .select('-password')
            .sort({ createdAt: -1 });

        res.status(200).json({ users });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error fetching users' });
    }
});

// Get single user by ID
router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ user });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error fetching user' });
    }
});

// Get current user profile
router.get('/profile/me', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ user });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error fetching profile' });
    }
});

// Update user profile
router.put('/profile/update', authMiddleware, async (req, res) => {
    try {
        const { firstName, lastName, bio, profilePic, location, contacts, skillsHave, skillsWant } = req.body;

        // Build update object
        const updateFields = {};
        if (firstName) updateFields.firstName = firstName;
        if (lastName) updateFields.lastName = lastName;
        if (bio !== undefined) updateFields.bio = bio;
        if (profilePic !== undefined) updateFields.profilePic = profilePic;
        if (location !== undefined) updateFields.location = location;
        if (contacts) updateFields.contacts = contacts;
        if (skillsHave) updateFields.skillsHave = skillsHave;
        if (skillsWant) updateFields.skillsWant = skillsWant;

        const updatedUser = await User.findByIdAndUpdate(
            req.user.id,
            { $set: updateFields },
            { new: true }
        ).select('-password');

        res.status(200).json({ 
            message: 'Profile updated successfully',
            user: updatedUser 
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error updating profile' });
    }
});

module.exports = router;
