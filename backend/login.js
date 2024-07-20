const express = require('express');
const bcrypt = require('bcryptjs');
const session = require('express-session');
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

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (email && password) {
    try {
      const result = await pool.query('SELECT * FROM "users" WHERE email = $1', [email]);
      if (result.rows.length > 0) {
        const user = result.rows[0];

        if (bcrypt.compareSync(password, user.password)) {
          if (!user.verified) {
            req.session.email = email;
            res.send(`
              <script>
                alert("Your email is not verified. Please verify your email.");
                window.location.href = "/verify";
              </script>
            `);
            return;
          }
          
          req.session.userId = user.id;
          req.session.email = email;
          res.send(`
            <script>
              alert("Welcome! ${user.email}");
              window.location.href = "/encrypt_decrypt";
            </script>
          `);
        } else {
          res.send(`
            <script>
              alert("Invalid email or password");
              window.location.href = "/login_signup";
            </script>
          `);
        }
      } else {
        res.send(`
          <script>
            alert("Invalid email or password");
            window.location.href = "/login_signup";
          </script>
        `);
      }
    } catch (err) {
      console.error(err);
      res.status(500).send('Error occurred');
    }
  } else {
    res.send(`
      <script>
        alert("Please enter email and password");
        window.location.href = "/login_signup";
      </script>
    `);
  }
});

module.exports = router;
