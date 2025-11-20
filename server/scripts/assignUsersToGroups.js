// Script to assign all existing users to groups based on their skills
// Run this once to add existing users to groups

const mongoose = require('mongoose');
const User = require('../models/User.model');
const Group = require('../models/Group.model');
const { assignUserToGroups } = require('../service/groupAlgorithm');
require('dotenv').config();

const assignAllUsers = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Get all users
    const users = await User.find({});
    console.log(`📊 Found ${users.length} users to process`);

    let assignedCount = 0;
    let skippedCount = 0;
    let defaultGroupCount = 0;

    for (const user of users) {
      console.log(`\n👤 Processing user: ${user.firstName} ${user.lastName} (@${user.username})`);
      
      // Check if user already has groups assigned
      if (user.groups && user.groups.length > 0) {
        console.log(`   ⏭️  User already in ${user.groups.length} group(s), skipping...`);
        skippedCount++;
        continue;
      }

      // Determine which groups this user should join
      let categoryNames;
      
      // If user has skills, assign based on skills
      if (user.skillsHave && user.skillsHave.length > 0) {
        categoryNames = assignUserToGroups(user);
        console.log(`   🎯 Skills found, assigning to: ${Array.from(categoryNames).join(', ')}`);
      } else if (user.skillsWant && user.skillsWant.length > 0) {
        categoryNames = assignUserToGroups(user);
        console.log(`   🎯 Skills to learn found, assigning to: ${Array.from(categoryNames).join(', ')}`);
      } else {
        // No skills at all - assign to Quality & Collaboration as default
        categoryNames = new Set(['Quality & Collaboration']);
        console.log(`   ℹ️  No skills found, assigning to default group: Quality & Collaboration`);
        defaultGroupCount++;
      }

      // Process each category
      for (const categoryName of categoryNames) {
        try {
          // Find or create the group
          let group = await Group.findOne({ name: categoryName });
          
          if (!group) {
            console.log(`   ➕ Creating new group: ${categoryName}`);
            // Group doesn't exist, create it with proper defaults
            const groupDefaults = {
              'Full-Stack Development': { icon: '💻', color: 'blue', description: 'Master front-end & back-end development' },
              'Mobile & Cross-Platform': { icon: '📱', color: 'purple', description: 'Build apps for iOS, Android, and more' },
              'Data & AI': { icon: '🤖', color: 'green', description: 'Explore data science & AI technologies' },
              'Cloud & Infrastructure': { icon: '☁️', color: 'cyan', description: 'Learn cloud platforms & DevOps' },
              'Security & Blockchain': { icon: '🔐', color: 'red', description: 'Dive into cybersecurity & blockchain' },
              'Creative & Gaming': { icon: '🎮', color: 'pink', description: 'Create games, graphics & multimedia' },
              'Quality & Collaboration': { icon: '🛠️', color: 'yellow', description: 'Testing, documentation & teamwork' }
            };
            
            const defaults = groupDefaults[categoryName] || { icon: '📚', color: 'blue', description: 'Learning group' };
            
            group = new Group({
              name: categoryName,
              icon: defaults.icon,
              color: defaults.color,
              description: defaults.description,
              members: [],
              messages: []
            });
            await group.save();
          }

          // Add user to group if not already a member
          if (!group.members.includes(user._id)) {
            group.members.push(user._id);
            
            // Add system message
            group.messages.push({
              message: `${user.firstName} ${user.lastName} joined the group`,
              messageType: 'system',
              createdAt: new Date()
            });
            
            await group.save();
            console.log(`   ✅ Added to group: ${categoryName}`);
          }

          // Add group to user's groups array
          if (!user.groups.includes(group._id)) {
            user.groups.push(group._id);
          }
        } catch (groupErr) {
          console.error(`   ❌ Error processing group ${categoryName}:`, groupErr.message);
        }
      }

      // Save user with updated groups
      await user.save();
      assignedCount++;
      console.log(`   ✅ User assigned to ${categoryNames.size} group(s)`);
    }

    console.log('\n' + '='.repeat(50));
    console.log('📊 ASSIGNMENT SUMMARY:');
    console.log('='.repeat(50));
    console.log(`✅ Users assigned: ${assignedCount}`);
    console.log(`⏭️  Users skipped (already in groups): ${skippedCount}`);
    console.log(`ℹ️  Users with no skills (assigned to default): ${defaultGroupCount}`);
    console.log(`📝 Total users processed: ${users.length}`);
    console.log('='.repeat(50));

    // Show group statistics
    const groups = await Group.find({}).populate('members', 'firstName lastName username');
    console.log('\n📊 GROUP STATISTICS:');
    console.log('='.repeat(50));
    for (const group of groups) {
      console.log(`${group.icon} ${group.name}: ${group.members.length} members`);
    }
    console.log('='.repeat(50));

    console.log('\n✅ All users have been assigned to groups!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
};

// Run the script
assignAllUsers();
