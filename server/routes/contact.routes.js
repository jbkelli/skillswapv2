const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');

// Configure email transporter (using Gmail)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Verify transporter configuration
transporter.verify(function(error, success) {
    if (error) {
        console.log('Email configuration error:', error);
        console.log('Please configure EMAIL_USER and EMAIL_PASS in your .env file');
    } else {
        console.log('Email server is ready to send messages');
    }
});

// Send contact form email
router.post('/send', async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;

        // Check if email is configured
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            return res.status(500).json({ 
                message: 'Email service not configured. Please set EMAIL_USER and EMAIL_PASS in .env file.' 
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
