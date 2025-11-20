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
        profilePicture: {
            type: String,
            default: ''
        },
        profileImage: {
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
        },
        isOnline: {
            type: Boolean,
            default: false
        },
        lastSeen: {
            type: Date,
            default: Date.now
        },
        groups: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Group'
        }],
        lockedGroups: [{
            groupId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Group'
            },
            lockedUntil: {
                type: Date,
                default: null
            },
            attempts: {
                type: Number,
                default: 0
            }
        }]
    },
    {
        timestamps: true,
    }
);

// Add indexes for faster queries
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ skillsHave: 1 });
userSchema.index({ skillsWant: 1 });
userSchema.index({ isOnline: 1 });

//Creates the user from the blueprint
const User = mongoose.model('User', userSchema);


//This exports the model so we can use it in other files
module.exports = User;