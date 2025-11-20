const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const { contactValidation } = require('../middleware/validation.middleware');

// Set up email sending with Gmail
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Optional email verification - only in development
if (process.env.NODE_ENV !== 'production') {
    transporter.verify(function(error, success) {
        if (error) {
            console.log('Note: Email service not configured (optional feature)');
        } else {
            console.log('✓ Email server is ready');
        }
    });
}

// Handle contact form submissions
router.post('/send', contactValidation, async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;

        // Make sure we have everything we need
        if (!name || !email || !subject || !message) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Check if email is set up properly
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            console.error('Email not configured - EMAIL_USER and EMAIL_PASS missing');
            return res.status(503).json({ 
                message: 'Email service is currently unavailable. Please try again later or contact us directly at tech.marval.innovations@gmail.com' 
            });
        }

        const mailOptions = {
            from: process.env.EMAIL_USER,
            replyTo: email,
            to: '444mwangialvinm@gmail.com, tech.marval.innovations@gmail.com',
            subject: `SkillSwap Contact: ${subject}`,
            html: `
                <h2>New Contact Form Submission</h2>
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Subject:</strong> ${subject}</p>
                <p><strong>Message:</strong></p>
                <p>${message}</p>
            `
        };

        await transporter.sendMail(mailOptions);

        res.status(200).json({ message: 'Email sent successfully' });
    } catch (err) {
        console.error('Email error:', err);
        res.status(500).json({ 
            message: 'Failed to send email. Please check email configuration.',
            error: err.message 
        });
    }
});

module.exports = router;
