const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');

// Set up email sending with Gmail
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // Use TLS
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    tls: {
        rejectUnauthorized: false
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
router.post('/send', async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;

        // Check if email is set up properly
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            // Email not configured - provide alternative contact method
            return res.status(200).json({ 
                message: 'Thank you for your message! Please contact us directly at tech.marval.innovations@gmail.com or 444mwangialvinm@gmail.com',
                fallback: true
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
