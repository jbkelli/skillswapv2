const User = require('../models/User.model');
const Group = require('../models/Group.model');
const { assignUserToGroups } = require('./groupAlgorithm');

/**
 * Automatically assign all existing users without groups to appropriate groups
 * This runs on server startup to ensure all users are assigned
 */
async function assignExistingUsers() {
    try {
        console.log('🔄 Starting automatic group assignment for existing users...');

        // Find all users who don't have any groups assigned
        const usersWithoutGroups = await User.find({ 
            $or: [
                { groups: { $exists: false } },
                { groups: { $size: 0 } }
            ]
        });

        if (usersWithoutGroups.length === 0) {
            console.log('✅ All existing users already have groups assigned');
            return;
        }

        console.log(`📋 Found ${usersWithoutGroups.length} users without groups`);

        let assignedCount = 0;
        let errorCount = 0;

        for (const user of usersWithoutGroups) {
            try {
                // Skip users who haven't added any skills yet
                if ((!user.skillsHave || user.skillsHave.length === 0) && 
                    (!user.skillsWant || user.skillsWant.length === 0)) {
                    console.log(`⚠️ User ${user.username} has no skills, skipping until they update profile...`);
                    continue;
                }

                // Get the group categories this user should be in
                const categoryNames = assignUserToGroups(user);

                if (categoryNames.length === 0) {
                    console.log(`⚠️ User ${user.username} has no matching skills, skipping...`);
                    continue;
                }

                // Find the groups that match these categories
                const groups = await Group.find({ name: { $in: categoryNames } });

                if (groups.length === 0) {
                    console.log(`⚠️ No groups found for categories: ${categoryNames.join(', ')}`);
                    continue;
                }

                // Add user to each group and add groups to user
                for (const group of groups) {
                    // Add user to group's members if not already there
                    if (!group.members.includes(user._id)) {
                        group.members.push(user._id);
                        await group.save();
                    }

                    // Add group to user's groups if not already there
                    if (!user.groups.includes(group._id)) {
                        user.groups.push(group._id);
                    }
                }

                await user.save();
                assignedCount++;
                console.log(`✅ Assigned ${user.username} to ${groups.length} group(s): ${categoryNames.join(', ')}`);

            } catch (err) {
                errorCount++;
                console.error(`❌ Error assigning user ${user.username}:`, err.message);
            }
        }

        console.log(`\n🎉 Auto-assignment complete!`);
        console.log(`   ✅ Successfully assigned: ${assignedCount} users`);
        if (errorCount > 0) {
            console.log(`   ❌ Errors: ${errorCount} users`);
        }

    } catch (err) {
        console.error('❌ Error in auto group assignment:', err.message);
    }
}

/**
 * Automatically assign a new user to groups based on their skills
 * This is called during registration or profile update
 */
async function assignNewUser(user) {
    try {
        console.log(`🔄 Auto-assigning groups for user: ${user.username}`);

        // Skip if user has no skills yet
        if ((!user.skillsHave || user.skillsHave.length === 0) && 
            (!user.skillsWant || user.skillsWant.length === 0)) {
            console.log(`⚠️ User ${user.username} has no skills yet, skipping assignment`);
            return [];
        }

        // Get the group categories this user should be in
        const categoryNames = assignUserToGroups(user);

        if (categoryNames.length === 0) {
            console.log(`⚠️ User ${user.username} has no matching skills`);
            return [];
        }

        // Find the groups that match these categories
        const groups = await Group.find({ name: { $in: categoryNames } });

        if (groups.length === 0) {
            console.log(`⚠️ No groups found for categories: ${categoryNames.join(', ')}`);
            return [];
        }

        // Add user to each group and add groups to user
        for (const group of groups) {
            // Add user to group's members if not already there
            if (!group.members.includes(user._id)) {
                group.members.push(user._id);
                await group.save();
            }

            // Add group to user's groups if not already there
            if (!user.groups.includes(group._id)) {
                user.groups.push(group._id);
            }
        }

        await user.save();
        console.log(`✅ Assigned ${user.username} to ${groups.length} group(s): ${categoryNames.join(', ')}`);

        return groups;

    } catch (err) {
        console.error(`❌ Error auto-assigning user ${user.username}:`, err.message);
        return [];
    }
}

module.exports = {
    assignExistingUsers,
    assignNewUser
};
