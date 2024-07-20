const express = require('express');
const { Pool } = require('pg');
const router = express.Router();

// PostgreSQL connection
//const pool = new Pool({
    //host: 'localhost', // Use 'localhost' for a local database
    //user: 'postgres',  // Your PostgreSQL username
    //password: 'erick', // Your PostgreSQL password
    //database: 'iaswebactivity', // The name of the database you created
    //port: 5432 // Default PostgreSQL port
  //});
  
//Database connection
const pool = new Pool({
    host: process.env.PG_HOST || 'dpg-cq6uvq6ehbks73979070-a',
    user: process.env.PG_USER || 'iaswebactivity_user',
    password: process.env.PG_PASSWORD || 'c1o0pK4As2yP6yWHZIf0ma1n0mUjU8Rs',
   database: process.env.PG_DATABASE || 'iaswebactivity',
   port: parseInt(process.env.PG_PORT, 10) || 5432
});

router.post('/verify', async (req, res) => {
    const { otp } = req.body;
    const email = req.session.email; // Assuming email is stored in session

    console.log('Received OTP:', otp);
    console.log('Session email:', email);

    if (!email) {
        console.error('Email not found in session');
        res.status(400).json({ message: "Email not found in session" });
        return;
    }

    try {
        // Fetch user ID by email
        const userResult = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
        const userId = userResult.rows[0]?.id;

        console.log('User ID:', userId);

        if (!userId) {
            console.error('User not found');
            res.status(400).json({ message: "User not found" });
            return;
        }

        // Check OTP validity
        const otpResult = await pool.query('SELECT * FROM email_verifications WHERE user_id = $1 AND otp = $2 AND expires_at > $3', [userId, otp, new Date()]);

        console.log('OTP result:', otpResult.rows);

        if (otpResult.rows.length > 0) {
            // OTP is valid, mark user as verified
            await pool.query('UPDATE users SET verified = TRUE WHERE id = $1', [userId]);

            // Delete the OTP
            await pool.query('DELETE FROM email_verifications WHERE user_id = $1 AND otp = $2', [userId, otp]);

            res.status(200).json({ message: "Email successfully verified" });
        } else {
            console.error('Invalid or expired OTP');
            res.status(400).json({ message: "Invalid or expired OTP" });
        }

    } catch (err) {
        console.error('Error verifying OTP:', err);
        res.status(500).json({ message: `Error: ${err.message}` });
    }
});

module.exports = router;
