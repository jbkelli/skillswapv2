const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User.model');///Importing the user model


//Registering a new user
router.post('/signup', async(req, res) => {
    try{
        //getting the fields from the request body
        const { firstName, lastName, username, email, password, skillsHave, skillsWant } = req.body;

        //simple validation
        if(!firstName || !lastName || !username || !email || !password){
            return res.status(400).json({ message: 'Please enter all required fields' });
        }

        //Checking if the user already exists
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if(existingUser){
            if(existingUser.email === email){
                return res.status(400).json({ message: 'User with this email already exists' });
            }
            return res.status(400).json({ message: 'Username already taken' });
        }

        //Hashing the password for security
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        //create the new user in the database
        const newUser = new User({
            firstName,
            lastName,
            username,
            email,
            password: hashedPassword,
            skillsHave: skillsHave || [],
            skillsWant: skillsWant || []
        });

        //Save the user
        await newUser.save();

        //Create JWT token
        const token = jwt.sign(
            { id: newUser._id, username: newUser.username },
            process.env.JWT_SECRET,
            { expiresIn: '3d' }
        );

        //Send response
        res.status(201).json({
            message: 'User created successfully',
            token,
            user: {
                id: newUser._id,
                firstName: newUser.firstName,
                lastName: newUser.lastName,
                username: newUser.username,
                email: newUser.email,
                skillsHave: newUser.skillsHave,
                skillsWant: newUser.skillsWant
            }
        });

    }
    catch(err){
        console.error(err);
        res.status(500).json({ message: 'Server error during sign up' });
    }
});

//Login routes
router.post('/login', async (req, res) => {
    try{
        //get email and password from the password
        const { email, password } = req.body;

        //simple validation
        if(!email || !password){
            return res.status(400).json({ message: 'Please enter all fields' });

        }

        //Find the user in the database
        const user = await User.findOne({ email: email });
        if(!user){
            //Sow a generic message
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        //Check if the password is correct
        //using bcrypt.compare to check the hashed password
        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch){
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        //If user is valid,, create a new JWT token
        const token = jwt.sign(
            { id: user._id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: '3d' }
        );

        //Send the token and the user info back(Not including the password)
        res.status(200).json({
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                username: user.username,
                email: user.email,
                skillsHave: user.skillsHave,
                skillsWant: user.skillsWant,
                bio: user.bio,
                profilePic: user.profilePic,
                location: user.location
            }
        });

    }
    catch(err){
        console.error(err);
        res.status(500).json({ message: 'Server error during login' });
    }
});

module.exports = router;