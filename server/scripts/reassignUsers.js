require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User.model');
const Group = require('../models/Group.model');
const { assignNewUser } = require('../service/autoGroupAssignment');

async function reassignAllUsers() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB\n');

        // Get all users with skills
        const users = await User.find({
            $or: [
                { skillsHave: { $exists: true, $ne: [] } },
                { skillsWant: { $exists: true, $ne: [] } }
            ]
        });
        
        console.log(`Found ${users.length} users with skills\n`);

        for (const user of users) {
            console.log(`Processing: ${user.firstName} ${user.lastName} (@${user.username})`);
            console.log(`Skills Have: ${user.skillsHave?.join(', ') || 'none'}`);
            console.log(`Skills Want: ${user.skillsWant?.join(', ') || 'none'}`);
            
            // Clear existing groups
            user.groups = [];
            await user.save();
            
            // Remove user from all groups
            await Group.updateMany(
                { members: user._id },
                { $pull: { members: user._id } }
            );
            
            // Reassign to correct groups
            await assignNewUser(user);
            
            // Verify assignment
            const updatedUser = await User.findById(user._id).populate('groups', 'name');
            console.log(`✅ Assigned to: ${updatedUser.groups.map(g => g.name).join(', ')}`);
            console.log('');
        }

        await mongoose.disconnect();
        console.log('✅ All users reassigned!');
    } catch (err) {
        console.error('❌ Error:', err);
        process.exit(1);
    }
}

reassignAllUsers();
