const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');

// Set up email sending with Gmail
const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    tls: {
        rejectUnauthorized: false,
        ciphers: 'SSLv3'
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 10000,
    pool: true,
    maxConnections: 5,
    maxMessages: 10
});

// Make sure email is properly configured
transporter.verify(function(error, success) {
    if (error) {
        console.error('⚠️  Email configuration warning:', error.message);
        console.log('EMAIL_USER:', process.env.EMAIL_USER ? `${process.env.EMAIL_USER.substring(0, 3)}***` : 'Not set');
        console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? 'Set (length: ' + process.env.EMAIL_PASS.length + ')' : 'Not set');
        console.log('Note: Email will be attempted when needed. Verify error might be due to network conditions.');
    } else {
        console.log('✅ Email server is ready to send messages');
    }
});

// Test endpoint to check email configuration
router.get('/test-email-config', async (req, res) => {
    try {
        const hasUser = !!process.env.EMAIL_USER;
        const hasPass = !!process.env.EMAIL_PASS;
        
        if (!hasUser || !hasPass) {
            return res.json({
                configured: false,
                EMAIL_USER: hasUser,
                EMAIL_PASS: hasPass,
                message: 'Email credentials not properly configured'
            });
        }
        
        await transporter.verify();
        res.json({
            configured: true,
            message: 'Email is properly configured and ready to send',
            user: process.env.EMAIL_USER
        });
    } catch (error) {
        res.status(500).json({
            configured: false,
            error: error.message,
            message: 'Email configuration test failed'
        });
    }
});

// Handle contact form submissions
router.post('/send', async (req, res) => {
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
        console.error('Email error details:', {
            message: err.message,
            code: err.code,
            command: err.command,
            response: err.response,
            responseCode: err.responseCode
        });
        
        let errorMessage = 'Failed to send email. ';
        
        if (err.code === 'EAUTH') {
            errorMessage += 'Authentication failed. Please check email credentials.';
        } else if (err.code === 'ESOCKET') {
            errorMessage += 'Connection error. Please try again.';
        } else {
            errorMessage += 'Please try again later.';
        }
        
        res.status(500).json({ 
            message: errorMessage,
            details: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
});

module.exports = router;
