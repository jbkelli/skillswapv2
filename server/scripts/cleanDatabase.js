const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const User = require('../models/User.model');

// Get the connection string
const uri = process.env.MONGODB_URI;

const cleanDatabase = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(uri);
        console.log('Connected to MongoDB ✅');

        // Delete all users
        const userResult = await User.deleteMany({});
        console.log(`Deleted ${userResult.deletedCount} users`);

        // You can also clean other collections if needed
        // const SwapRequest = require('../models/SwapRequest.model');
        // const Message = require('../models/Message.model');
        // await SwapRequest.deleteMany({});
        // await Message.deleteMany({});

        console.log('Database cleaned successfully! 🧹');
        
        // Close connection
        await mongoose.connection.close();
        console.log('Connection closed');
        process.exit(0);
    } catch (error) {
        console.error('Error cleaning database:', error);
        process.exit(1);
    }
};

cleanDatabase();
