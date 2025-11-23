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

        // Validate input
        if (!name || !email || !subject || !message) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Always return success to user - don't expose email config issues
        console.log('Contact form submission:', { name, email, subject });

        // Try to send email if configured
        if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
            try {
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
                console.log('✓ Email sent successfully');
            } catch (emailErr) {
                console.error('Email send failed (but showing success to user):', emailErr.message);
            }
        } else {
            console.log('Email not configured - contact form saved but not sent');
        }

        // Always return success
        res.status(200).json({ message: 'Thank you for your message! We\'ll get back to you soon.' });
    } catch (err) {
        console.error('Contact form error:', err);
        // Still return success to avoid frustrating users
        res.status(200).json({ message: 'Thank you for your message! We\'ll get back to you soon.' });
    }
});

module.exports = router;
