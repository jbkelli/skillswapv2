const express = require('express');
const router = express.Router();
const User = require('../models/User.model');
const authMiddleware = require('../middleware/auth.middleware');
const { assignNewUser } = require('../service/autoGroupAssignment');

// Get all users for the discovery/matching page
router.get('/all', authMiddleware, async (req, res) => {
    try {
        // Fetch everyone except the logged-in user, hide passwords
        const users = await User.find({ _id: { $ne: req.user.id } })
            .select('-password')
            .sort({ createdAt: -1 });

        res.status(200).json({ users });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error fetching users' });
    }
});

// Look up a specific user's profile
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

// Get the logged-in user's own profile
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
        const { firstName, lastName, bio, profilePic, profilePicture, profileImage, location, contacts, skillsHave, skillsWant } = req.body;

        console.log('Updating profile for user:', req.user.id);
        console.log('Update data:', { firstName, lastName, bio, location, contacts, skillsHave, skillsWant });

        // Build update object
        const updateFields = {};
        if (firstName) updateFields.firstName = firstName;
        if (lastName) updateFields.lastName = lastName;
        if (bio !== undefined) updateFields.bio = bio;
        
        // Handle all profile picture field variations
        const profilePicValue = profilePic || profilePicture || profileImage;
        if (profilePicValue !== undefined) {
            updateFields.profilePic = profilePicValue;
            updateFields.profilePicture = profilePicValue;
            updateFields.profileImage = profilePicValue;
        }
        
        if (location !== undefined) updateFields.location = location;
        if (contacts) updateFields.contacts = contacts;
        if (skillsHave) updateFields.skillsHave = skillsHave;
        if (skillsWant) updateFields.skillsWant = skillsWant;

        const updatedUser = await User.findByIdAndUpdate(
            req.user.id,
            { $set: updateFields },
            { new: true, runValidators: true }
        ).select('-password');

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        // If skills were updated, re-assign user to groups
        if (skillsHave || skillsWant) {
            await assignNewUser(updatedUser);
        }

        console.log('Profile updated successfully');

        res.status(200).json({ 
            message: 'Profile updated successfully',
            user: updatedUser 
        });
    } catch (err) {
        console.error('Profile update error:', err);
        res.status(500).json({ message: err.message || 'Server error updating profile' });
    }
});

module.exports = router;
