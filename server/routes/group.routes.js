const express = require('express');
const router = express.Router();
const Group = require('../models/Group.model');
const User = require('../models/User.model');
const authMiddleware = require('../middleware/auth.middleware');
const { skillCategories, assignUserToGroups } = require('../service/groupAlgorithm');
const quizQuestions = require('../data/quizQuestions');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for group file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../uploads/groups');
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
    limits: { fileSize: 10 * 1024 * 1024 }
});

// Initialize all 7 groups
router.post('/initialize', authMiddleware, async (req, res) => {
    try {
        const existingGroups = await Group.find();
        
        if (existingGroups.length > 0) {
            return res.status(200).json({ message: 'Groups already initialized', groups: existingGroups });
        }

        const groups = [];
        for (const [name, data] of Object.entries(skillCategories)) {
            const group = new Group({
                name,
                icon: data.icon,
                color: data.color,
                description: data.description,
                members: [],
                messages: []
            });
            await group.save();
            groups.push(group);
        }

        res.status(201).json({ message: 'Groups initialized successfully', groups });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error initializing groups' });
    }
});

// Assign user to appropriate groups
router.post('/assign-user', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const categoryNames = assignUserToGroups(user);
        const assignedGroups = [];

        for (const categoryName of categoryNames) {
            let group = await Group.findOne({ name: categoryName });
            
            if (!group) {
                // Create group if it doesn't exist
                const categoryData = skillCategories[categoryName];
                group = new Group({
                    name: categoryName,
                    icon: categoryData.icon,
                    color: categoryData.color,
                    description: categoryData.description,
                    members: [],
                    messages: []
                });
            }

            // Add user to group if not already a member
            if (!group.members.includes(user._id)) {
                group.members.push(user._id);
                
                // Add system message
                group.messages.push({
                    sender: null,
                    message: `${user.firstName} ${user.lastName} joined the group`,
                    messageType: 'system',
                    createdAt: new Date()
                });
                
                await group.save();
                assignedGroups.push(group);
            }

            // Add group to user's groups array
            if (!user.groups.includes(group._id)) {
                user.groups.push(group._id);
            }
        }

        await user.save();

        res.status(200).json({ 
            message: 'User assigned to groups successfully', 
            groups: assignedGroups 
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error assigning user to groups' });
    }
});

// Assign ALL existing users to groups (admin/migration endpoint)
router.post('/assign-all-users', authMiddleware, async (req, res) => {
    try {
        const users = await User.find({});
        let assignedCount = 0;
        let skippedCount = 0;
        let defaultGroupCount = 0;

        for (const user of users) {
            // Skip if user already has groups
            if (user.groups && user.groups.length > 0) {
                skippedCount++;
                continue;
            }

            // Determine which groups this user should join
            let categoryNames;
            
            if ((user.skillsHave && user.skillsHave.length > 0) || (user.skillsWant && user.skillsWant.length > 0)) {
                categoryNames = assignUserToGroups(user);
            } else {
                // No skills - assign to default group
                categoryNames = new Set(['Quality & Collaboration']);
                defaultGroupCount++;
            }

            // Process each category
            for (const categoryName of categoryNames) {
                let group = await Group.findOne({ name: categoryName });
                
                if (!group) {
                    // Create group if it doesn't exist
                    const categoryData = skillCategories[categoryName];
                    group = new Group({
                        name: categoryName,
                        icon: categoryData?.icon || '📚',
                        color: categoryData?.color || 'blue',
                        description: categoryData?.description || 'Learning group',
                        members: [],
                        messages: []
                    });
                }

                // Add user to group
                if (!group.members.includes(user._id)) {
                    group.members.push(user._id);
                    group.messages.push({
                        message: `${user.firstName} ${user.lastName} joined the group`,
                        messageType: 'system',
                        createdAt: new Date()
                    });
                    await group.save();
                }

                // Add group to user
                if (!user.groups.includes(group._id)) {
                    user.groups.push(group._id);
                }
            }

            await user.save();
            assignedCount++;
        }

        res.status(200).json({
            message: 'All users assigned to groups',
            stats: {
                totalUsers: users.length,
                assigned: assignedCount,
                skipped: skippedCount,
                assignedToDefault: defaultGroupCount
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error assigning all users' });
    }
});

// NOTE: The /assign-all-users endpoint above is deprecated.
// Auto-assignment now happens automatically via:
// 1. On server startup (assignExistingUsers in server.js)
// 2. On user registration (assignNewUser in auth.routes.js)
// 3. On profile update with skills (assignNewUser in user.routes.js)

// IMPORTANT: Specific routes MUST come before parameterized routes like /:groupId

// Get all user's groups
router.get('/my-groups', authMiddleware, async (req, res) => {
    try {
        const groups = await Group.find({ members: req.user.id })
            .populate('members', 'firstName lastName username profilePic profilePicture profileImage isOnline lastSeen')
            .sort({ name: 1 });

        res.status(200).json({ groups });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error fetching groups' });
    }
});

// Get all groups (including ones user is not part of)
router.get('/all-groups', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const allGroups = await Group.find({}).select('name icon color description members');
        
        // Categorize groups
        const userGroups = [];
        const lockedGroups = [];
        const availableGroups = [];

        allGroups.forEach(group => {
            const isMember = group.members.some(memberId => memberId.toString() === req.user.id);
            const lockedGroup = user.lockedGroups?.find(lg => lg.groupId.toString() === group._id.toString());
            
            if (isMember) {
                userGroups.push(group);
            } else if (lockedGroup && lockedGroup.lockedUntil && new Date() < new Date(lockedGroup.lockedUntil)) {
                // Group is locked
                lockedGroups.push({
                    ...group.toObject(),
                    lockedUntil: lockedGroup.lockedUntil,
                    attempts: lockedGroup.attempts
                });
            } else {
                // Group is available to unlock
                availableGroups.push({
                    ...group.toObject(),
                    attempts: lockedGroup?.attempts || 0
                });
            }
        });

        res.status(200).json({
            userGroups,
            availableGroups,
            lockedGroups
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error fetching groups' });
    }
});

// Get specific group details
router.get('/:groupId', authMiddleware, async (req, res) => {
    try {
        const group = await Group.findById(req.params.groupId)
            .populate('members', 'firstName lastName username profilePic profilePicture profileImage isOnline lastSeen')
            .populate('messages.sender', 'firstName lastName username profilePic profilePicture profileImage')
            .populate('messages.vallyTriggeredBy', 'firstName lastName username');

        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        res.status(200).json({ group });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error fetching group' });
    }
});

// Send message to group
router.post('/:groupId/message', authMiddleware, async (req, res) => {
    try {
        const { message, isVally, vallyResponse } = req.body;
        const group = await Group.findById(req.params.groupId);

        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        if (!group.members.includes(req.user.id)) {
            return res.status(403).json({ message: 'You are not a member of this group' });
        }

        // Add user's message
        const userMessage = {
            sender: req.user.id,
            message,
            messageType: 'text',
            createdAt: new Date()
        };
        group.messages.push(userMessage);

        // If it's a Vally request, add Vally's response too
        if (isVally && vallyResponse) {
            const vallyMessage = {
                sender: req.user.id,
                message: vallyResponse,
                messageType: 'text',
                isVally: true,
                vallyTriggeredBy: req.user.id,
                createdAt: new Date()
            };
            group.messages.push(vallyMessage);
        }

        await group.save();

        const populatedGroup = await Group.findById(group._id)
            .populate('messages.sender', 'firstName lastName username profilePic profilePicture profileImage')
            .populate('messages.vallyTriggeredBy', 'firstName lastName username');

        res.status(201).json({ 
            message: 'Message sent successfully', 
            messages: populatedGroup.messages.slice(-2) // Return last 1 or 2 messages
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error sending message' });
    }
});

// Send file to group
router.post('/:groupId/send-file', authMiddleware, upload.single('file'), async (req, res) => {
    try {
        const { message } = req.body;
        const group = await Group.findById(req.params.groupId);

        if (!group) {
            return res.status(400).json({ message: 'Group not found' });
        }

        if (!group.members.includes(req.user.id)) {
            return res.status(403).json({ message: 'You are not a member of this group' });
        }

        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const isImage = /\.(jpg|jpeg|png|gif)$/i.test(req.file.originalname);
        const messageType = isImage ? 'image' : 'file';

        const newMessage = {
            sender: req.user.id,
            message: message || '',
            messageType: messageType,
            fileUrl: `/uploads/groups/${req.file.filename}`,
            fileName: req.file.originalname,
            fileSize: req.file.size,
            createdAt: new Date()
        };

        group.messages.push(newMessage);
        await group.save();

        const populatedGroup = await Group.findById(group._id)
            .populate('messages.sender', 'firstName lastName username profilePic profilePicture profileImage');

        res.status(201).json({ 
            message: 'File sent successfully',
            data: populatedGroup.messages[populatedGroup.messages.length - 1]
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error sending file' });
    }
});

// Get group members with online status
router.get('/:groupId/members', authMiddleware, async (req, res) => {
    try {
        const group = await Group.findById(req.params.groupId)
            .populate('members', 'firstName lastName username profilePic profilePicture profileImage isOnline lastSeen');

        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        res.status(200).json({ members: group.members });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error fetching members' });
    }
});

// Get quiz for a specific group
router.get('/:groupId/quiz', authMiddleware, async (req, res) => {
    try {
        const group = await Group.findById(req.params.groupId);
        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        // Check if user is already a member
        if (group.members.includes(req.user.id)) {
            return res.status(400).json({ message: 'You are already a member of this group' });
        }

        // Check if group is locked
        const user = await User.findById(req.user.id);
        const lockedGroup = user.lockedGroups?.find(lg => lg.groupId.toString() === req.params.groupId);
        
        if (lockedGroup && lockedGroup.lockedUntil && new Date() < new Date(lockedGroup.lockedUntil)) {
            const daysLeft = Math.ceil((new Date(lockedGroup.lockedUntil) - new Date()) / (1000 * 60 * 60 * 24));
            return res.status(403).json({ 
                message: `Group is locked. Try again in ${daysLeft} day(s).`,
                lockedUntil: lockedGroup.lockedUntil
            });
        }

        // Get quiz questions for this group
        const questions = quizQuestions[group.name];
        if (!questions) {
            return res.status(404).json({ message: 'Quiz not available for this group' });
        }

        // Randomly select 10 questions and include an index for grading
        const shuffled = questions.sort(() => 0.5 - Math.random());
        const selectedQuestions = shuffled.slice(0, 10).map((q, index) => ({
            id: index, // Temporary ID for this quiz session
            question: q.question,
            options: q.options,
            correctAnswer: q.correctAnswer // Send to client for verification
        }));

        res.status(200).json({
            groupName: group.name,
            questions: selectedQuestions,
            passingScore: 7
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error fetching quiz' });
    }
});

// Submit quiz answers and unlock group
router.post('/:groupId/submit-quiz', authMiddleware, async (req, res) => {
    try {
        const { answers } = req.body; // Array of {questionId, selectedAnswer}
        const group = await Group.findById(req.params.groupId);
        
        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        // Check if user is already a member
        if (group.members.includes(req.user.id)) {
            return res.status(400).json({ message: 'You are already a member of this group' });
        }

        // Grade the quiz (answers already include correct answer from client)
        let correctCount = 0;
        answers.forEach((answer) => {
            if (answer.isCorrect) {
                correctCount++;
            }
        });

        const user = await User.findById(req.user.id);
        const passed = correctCount >= 7;

        if (passed) {
            // Add user to group
            group.members.push(user._id);
            group.messages.push({
                message: `${user.firstName} ${user.lastName} joined the group after passing the quiz!`,
                messageType: 'system',
                createdAt: new Date()
            });
            await group.save();

            // Add group to user
            user.groups.push(group._id);
            
            // Remove from locked groups if present
            user.lockedGroups = user.lockedGroups?.filter(lg => 
                lg.groupId.toString() !== group._id.toString()
            ) || [];
            
            await user.save();

            res.status(200).json({
                success: true,
                score: correctCount,
                message: `Congratulations! You scored ${correctCount}/10 and unlocked the group!`,
                group
            });
        } else {
            // Lock the group for 7 days
            const lockDate = new Date();
            lockDate.setDate(lockDate.getDate() + 7);

            const existingLock = user.lockedGroups?.find(lg => 
                lg.groupId.toString() === group._id.toString()
            );

            if (existingLock) {
                existingLock.lockedUntil = lockDate;
                existingLock.attempts += 1;
            } else {
                if (!user.lockedGroups) user.lockedGroups = [];
                user.lockedGroups.push({
                    groupId: group._id,
                    lockedUntil: lockDate,
                    attempts: 1
                });
            }
            
            await user.save();

            res.status(200).json({
                success: false,
                score: correctCount,
                message: `You scored ${correctCount}/10. You need at least 7 correct answers.`,
                lockedUntil: lockDate
            });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error submitting quiz' });
    }
});

module.exports = router;
