const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const messageSchema = new Schema(
    {
        sender: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        receiver: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        message: {
            type: String,
            required: false
        },
        messageType: {
            type: String,
            enum: ['text', 'image', 'file'],
            default: 'text'
        },
        fileUrl: {
            type: String,
            required: false
        },
        fileName: {
            type: String,
            required: false
        },
        fileSize: {
            type: Number,
            required: false
        },
        read: {
            type: Boolean,
            default: false
        },
        isVally: {
            type: Boolean,
            default: false
        },
        vallyTriggeredBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: false
        }
    },
    {
        timestamps: true
    }
);

// Add indexes for faster message queries
messageSchema.index({ sender: 1, receiver: 1 });
messageSchema.index({ receiver: 1, sender: 1 });
messageSchema.index({ createdAt: -1 });
messageSchema.index({ read: 1 });

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;
