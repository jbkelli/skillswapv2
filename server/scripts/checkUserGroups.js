require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User.model');
const Group = require('../models/Group.model');
const { assignUserToGroups } = require('../service/groupAlgorithm');

async function checkUserGroups() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB\n');

        // Get all users
        const users = await User.find({}).select('firstName lastName username skillsHave skillsWant groups');
        
        console.log(`Total users: ${users.length}\n`);

        for (const user of users) {
            console.log('═══════════════════════════════════════');
            console.log(`User: ${user.firstName} ${user.lastName} (@${user.username})`);
            console.log(`Skills Have: ${JSON.stringify(user.skillsHave || [])}`);
            console.log(`Skills Want: ${JSON.stringify(user.skillsWant || [])}`);
            console.log(`Current Groups: ${user.groups?.length || 0}`);
            
            // Check what groups they SHOULD be in
            const shouldBeInGroups = assignUserToGroups(user);
            console.log(`Should be in groups: ${JSON.stringify(shouldBeInGroups)}`);
            
            if (user.groups && user.groups.length > 0) {
                const groupDetails = await Group.find({ _id: { $in: user.groups } }).select('name');
                console.log(`Actual groups: ${groupDetails.map(g => g.name).join(', ')}`);
            } else {
                console.log('Actual groups: NONE');
            }
            console.log('');
        }

        await mongoose.disconnect();
        console.log('Done!');
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

checkUserGroups();
