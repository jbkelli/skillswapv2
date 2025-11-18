const mongoose = require('mongoose');
require('dotenv').config();

// Bring in our database models
const User = require('../models/User.model');

// Grab the MongoDB connection string
const uri = process.env.MONGODB_URI;

const cleanDatabase = async () => {
    try {
        // Connect to the database
        await mongoose.connect(uri);
        console.log('Connected to MongoDB ✅');

        // Wipe out all users
        const userResult = await User.deleteMany({});
        console.log(`Deleted ${userResult.deletedCount} users`);

        // Uncomment these if you want to clean other collections too
        // const SwapRequest = require('../models/SwapRequest.model');
        // const Message = require('../models/Message.model');
        // await SwapRequest.deleteMany({});
        // await Message.deleteMany({});

        console.log('Database cleaned successfully! 🧹');
        
        // Disconnect when done
        await mongoose.connection.close();
        console.log('Connection closed');
        process.exit(0);
    } catch (error) {
        console.error('Error cleaning database:', error);
        process.exit(1);
    }
};

cleanDatabase();
