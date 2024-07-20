const express = require('express');
const router = express.Router();
const transporter = require('./mailer');

router.post('/contact', (req, res) => {
    const { name, email, message } = req.body;

    const mailOptions = {
        from: email, // Use the email from the form input
        to: 'marygrace.dapdap@bicol-u.edu.ph', // Replace with the recipient's email address
        subject: 'New Contact Us Message',
        text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending email:', error);
            res.status(500).json({ message: 'Error sending email' });
        } else {
            console.log('Email sent:', info.response);
            res.status(200).json({ message: 'Email sent successfully' });
        }
    });
});

module.exports = router;
