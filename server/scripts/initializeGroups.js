require('dotenv').config();
const mongoose = require('mongoose');
const Group = require('../models/Group.model');
const { skillCategories } = require('../service/groupAlgorithm');

async function initializeGroups() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB\n');

        const existingGroups = await Group.find();
        
        if (existingGroups.length > 0) {
            console.log(`Found ${existingGroups.length} existing groups:`);
            existingGroups.forEach(g => console.log(`  - ${g.name}`));
            console.log('\nDeleting existing groups...');
            await Group.deleteMany({});
        }

        console.log('\nCreating 7 groups...\n');

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
            console.log(`✅ Created: ${data.icon} ${name}`);
        }

        await mongoose.disconnect();
        console.log('\n✅ All groups initialized!');
    } catch (err) {
        console.error('❌ Error:', err);
        process.exit(1);
    }
}

initializeGroups();
