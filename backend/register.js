const express = require('express');
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
const session = require('express-session');
const crypto = require('crypto');
const transporter = require('./mailer'); // Adjust path to your mailer.js file

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
    host: process.env.PG_HOST || 'dpg-cq7k6i5ds78s73d8fccg-a',
    user: process.env.PG_USER || 'iaswebpage_user',
    password: process.env.PG_PASSWORD || 'JqaiElt5jmcURnjyNYxm5K6gUUdfj3dA',
   database: process.env.PG_DATABASE || 'iaswebpage',
   port: parseInt(process.env.PG_PORT, 10) || 5432
});

// Session configuration
router.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Note: For production, use 'secure: true' with HTTPS
}));

router.post('/register', async (req, res) => {
    const { email, password, confirmpassword } = req.body;

    if (password === confirmpassword) {
        try {
            const hashedPassword = bcrypt.hashSync(password, 10);
            const result = await pool.query('INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id', [email, hashedPassword]);
            const userId = result.rows[0].id;

            // Generate OTP
            const otp = crypto.randomInt(100000, 999999).toString();
            const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // OTP expires in 15 minutes

            // Insert OTP into database
            await pool.query('INSERT INTO email_verifications (user_id, otp, expires_at) VALUES ($1, $2, $3)', [userId, otp, expiresAt]);

            // Send OTP email
            const mailOptions = {
                from: 'marygrace.dapdap@bicol-u.edu.ph',
                to: email,
                subject: 'Email Verification',
                text: `Your OTP code is ${otp}. It expires in 15 minutes.`
            };

            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.error('Error sending email:', error);
                    res.send(`
                        <script>
                            alert("Error sending verification email");
                            window.location.href = "/login_signup";
                        </script>
                    `);
                } else {
                    console.log('Email sent:', info.response);
                    req.session.email = email; // Store email in session
                    req.session.save(err => {
                        if (err) {
                            console.error('Session save error:', err);
                            res.send(`
                                <script>
                                    alert("Error saving session");
                                    window.location.href = "/login_signup";
                                </script>
                            `);
                        } else {
                            res.send(`
                                <script>
                                    alert("Registration successful. Check your email for the OTP.");
                                    window.location.href = "/verify";
                                </script>
                            `);
                        }
                    });
                }
            });

        } catch (err) {
            console.error(err);
            res.send(`
                <script>
                    alert("Error: ${err.message}");
                    window.location.href = "/login_signup";
                </script>
            `);
        }
    } else {
        res.send(`
            <script>
                alert("Passwords do not match");
                window.location.href = "/login_signup";
            </script>
        `);
    }
});

module.exports = router;
