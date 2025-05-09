require('dotenv').config();
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../server/server');
const router = express.Router();
const SECRET = process.env.JWT_SECRET
const ADMINPASSWORD = process.env.ADMIN_PASSWORD
const { v4: uuidv4 } = require('uuid');


router.post('/register', async (req, res) => {
  const { first_name, last_name, email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    // Check if user already exists
    const existingUser = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(409).json({ message: 'User already exists' });
    }

    // Generate a UUID for the new user
    const uid = uuidv4();

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user with UUID
    const newUser = await db.query(
      'INSERT INTO users (uid, first_name, last_name, email, password) VALUES ($1, $2, $3, $4, $5) RETURNING id, email',
      [uid, first_name, last_name, email, hashedPassword]
    );


    res.status(201).json({ message: 'User registered successfully', status: 'success' });

  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});


router.post('/register/coach', async (req, res) => {
  const { first_name, last_name, email, password, admin_password } = req.body;

  if(admin_password !== ADMINPASSWORD){
    return res.status(500).json({ message: 'You are not authorized to make this request' });
  }

  if (!email || !password || !first_name || !last_name) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    // Check if coach already exists
    const existingUser = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(409).json({ message: 'User already exists' });
    }

    const uid = uuidv4();
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await db.query(
      'INSERT INTO users (uid, first_name, last_name, email, password, role) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, email, role',
      [uid, first_name, last_name, email, hashedPassword, 'coach']
    );

    const token = jwt.sign({ id: newUser.rows[0].id, email }, SECRET, { expiresIn: '1h' });

    res.status(201).json({
      message: 'Coach registered successfully',
      status: 'success',
      role: newUser.rows[0].role
    });

  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});


// Login route
router.post('/login', async (req, res) => {
  const { email, password } = req.body; // or email

  try {
    const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user) return res.status(400).json({ message: 'User not found' });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(401).json({ message: 'Invalid password' });

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role, uid: user.uid }, SECRET, { expiresIn: '5h' });
    res.json({ user: user.email, token, status: 'success' });

  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});


const authenticateToken = require('../middleware/middlewareAuth');

router.get('/profile', authenticateToken, async (req, res) => {
  try {

    console.log("USER ROLE", req.user.uid)

   const result = await db.query('SELECT * FROM users WHERE id = $1', [req.user.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
