const mongoose = require('mongoose');
require('dotenv').config();

// Grab the MongoDB connection string
const uri = process.env.MONGODB_URI;

const fixIndexes = async () => {
    try {
        // Connect to the database
        await mongoose.connect(uri);
        console.log('Connected to MongoDB ✅');

        // Get the swaprequests collection
        const db = mongoose.connection.db;
        const collection = db.collection('swaprequests');

        // List all indexes
        console.log('\nCurrent indexes:');
        const indexes = await collection.indexes();
        console.log(JSON.stringify(indexes, null, 2));

        // Drop the old fromUser_toUser index if it exists
        try {
            await collection.dropIndex('fromUser_1_toUser_1');
            console.log('\n✅ Successfully dropped old fromUser_1_toUser_1 index');
        } catch (err) {
            if (err.code === 27 || err.message.includes('index not found')) {
                console.log('\n⚠️  Index fromUser_1_toUser_1 not found (might already be dropped)');
            } else {
                throw err;
            }
        }

        // Create proper indexes for the current schema
        console.log('\nCreating new indexes...');
        
        // Index for finding requests by sender
        await collection.createIndex({ sender: 1 });
        console.log('✅ Created index: sender_1');
        
        // Index for finding requests by receiver
        await collection.createIndex({ receiver: 1 });
        console.log('✅ Created index: receiver_1');
        
        // Compound index for status queries
        await collection.createIndex({ sender: 1, receiver: 1, status: 1 });
        console.log('✅ Created index: sender_1_receiver_1_status_1');

        // List indexes after changes
        console.log('\nUpdated indexes:');
        const newIndexes = await collection.indexes();
        console.log(JSON.stringify(newIndexes, null, 2));

        console.log('\n🎉 Index fix completed successfully!');
        
        // Disconnect when done
        await mongoose.connection.close();
        console.log('Connection closed');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error fixing indexes:', err);
        process.exit(1);
    }
};

fixIndexes();
