const express = require('express');
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const router = express.Router();
require('dotenv').config();

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
// Nodemailer configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    type: 'OAuth2',
    user: 'marygrace.dapdap@bicol-u.edu.ph',
    clientId: '713389655695-77ofleooid780etvc11juhdbjk1q3asg.apps.googleusercontent.com',
    clientSecret: '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',
    refreshToken: '1//041tyXa8jZ3flCgYIARAAGAQSNwF-L9IrSi86k0QzMO-9N-en-2U5Z_avP_kEFeg8wBlGlKkMt7PSKjvLje0sFFaUFc37Sswf3tI'
  }
});

router.post('/forgot_password', async (req, res) => {
  const { email } = req.body;

  try {
    // Check if email exists
    const userQuery = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

    if (userQuery.rows.length > 0) {
      const user = userQuery.rows[0];

      // Generate a reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const hashedToken = bcrypt.hashSync(resetToken, 10);

      // Set token expiration time (1 hour)
      const expiresAt = new Date(Date.now() + 3600000);

      // Save token to the database
      await pool.query(
        'INSERT INTO password_resets (user_id, otp, expires_at) VALUES ($1, $2, $3)',
        [user.id, hashedToken, expiresAt]
      );

      // Send reset link to the user's email
      const resetLink = `http://localhost:3001/reset_password.html?token=${resetToken}&id=${user.id}`;

      const mailOptions = {
        from: 'charlesrussellllovido.naag@bicol-u.edu.ph',
        to: email,
        subject: 'Password Reset Request',
        text: `You requested a password reset. Click the link to reset your password: ${resetLink}`,
        html: `<p>You requested a password reset. Click the link to reset your password:</p><p><a href="${resetLink}">${resetLink}</a></p>`
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error('Error sending email:', error);
          res.status(500).send('Error sending email');
        } else {
          res.send(`
            <script>
              alert("Password reset link sent to your email.");
              window.location.href = "/login_signup";
            </script>
          `);
        }
      });
    } else {
      res.send(`
        <script>
          alert("Email not found. Please try again.");
          window.location.href = "/login_signup";
        </script>
      `);
    }
  } catch (err) {
    console.error(err);
    res.send(`
      <script>
        alert("Error processing request: ${err.message}");
        window.location.href = "/login_signup";
      </script>
    `);
  }
});

router.post('/reset_password', async (req, res) => {
  const { token, id, newpassword, confirmpassword } = req.body;

  if (newpassword === confirmpassword) {
    try {
      const resetQuery = await pool.query('SELECT * FROM password_resets WHERE user_id = $1', [id]);

      if (resetQuery.rows.length > 0) {
        const resetRecord = resetQuery.rows[0];

        // Check if token is valid and not expired
        if (bcrypt.compareSync(token, resetRecord.otp) && new Date() < new Date(resetRecord.expires_at)) {
          const hashedPassword = bcrypt.hashSync(newpassword, 10);

          await pool.query('UPDATE users SET password = $1 WHERE id = $2', [hashedPassword, id]);
          await pool.query('DELETE FROM password_resets WHERE user_id = $1', [id]);

          res.send(`
            <script>
              alert("Password reset successfully.");
              window.location.href = "/login_signup";
            </script>
          `);
        } else {
          res.send(`
            <script>
              alert("Invalid or expired token. Please try again.");
              window.location.href = "/login_signup";
            </script>
          `);
        }
      } else {
        res.send(`
          <script>
            alert("Invalid request. Please try again.");
            window.location.href = "/login_signup";
          </script>
        `);
      }
    } catch (err) {
      console.error(err);
      res.send(`
        <script>
          alert("Error processing request: ${err.message}");
          window.location.href = "/login_signup";
        </script>
      `);
    }
  } else {
    res.send(`
      <script>
        alert("New password and confirm password do not match.");
        window.location.href = "/login_signup";
      </script>
    `);
  }
});

module.exports = router;
