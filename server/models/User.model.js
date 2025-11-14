const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//Blueprint for our user
const userSchema = new Schema(
    {
        firstName: {
            type: String,
            required: true,
            trim: true
        },
        lastName: {
            type: String,
            required: true,
            trim: true
        },
        username: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            minlength: 3
        },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true
        },
        password: {
            type: String,
            required: true,
            minlength: 6
        },
        skillsHave: {
            type: [String],
            default: []
        },
        skillsWant: {
            type: [String],
            default: []
        },
        bio: {
            type: String,
            default: '',
            maxlength: 500
        },
        profilePic: {
            type: String,
            default: ''
        },
        location: {
            type: String,
            default: ''
        },
        contacts: {
            phone: { type: String, default: '' },
            linkedin: { type: String, default: '' },
            github: { type: String, default: '' },
            twitter: { type: String, default: '' }
        }
    },
    {
        timestamps: true,
    }
);

//Creates the user from the blueprint
const User = mongoose.model('User', userSchema);


//This exports the model so we can use it in other files
module.exports = User;