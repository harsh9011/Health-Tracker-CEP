const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const googleSheetsService = require('../services/googleSheetsService');

// Validation helper functions
const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

const validatePassword = (password) => {
  return password.length >= 6;
};

const validateAge = (age) => {
  const ageNum = parseInt(age);
  return !isNaN(ageNum) && ageNum >= 1 && ageNum <= 120;
};

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

// Login route
router.post('/login', async (req, res) => {
  try {
    const { email, password, role } = req.body;
    
    // Enhanced validation
    if (!email || !password || !role) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    if (!validatePassword(password)) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    if (!['student', 'doctor'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    // Get user from Google Sheets
    const user = await googleSheetsService.getUserByEmail(email);
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (user.role !== role) {
      return res.status(401).json({ message: 'Role mismatch' });
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = generateToken(user);

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    res.json({ 
      message: 'Login successful', 
      user: userWithoutPassword,
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all users (for doctor dashboard)
router.get('/users', async (req, res) => {
  try {
    const users = await googleSheetsService.getAllUsers();
    res.json({
      message: 'Users retrieved successfully',
      users: users
    });
  } catch (error) {
    console.error('Error getting users:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Register route
router.post('/register', async (req, res) => {
  try {
    const { fullName, email, password, role, age, gender } = req.body;
    
    // Enhanced validation
    if (!fullName || !email || !password || !role || !age || !gender) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (fullName.trim().length < 2) {
      return res.status(400).json({ message: 'Full name must be at least 2 characters' });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    if (!validatePassword(password)) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    if (!['student', 'doctor'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    if (!validateAge(age)) {
      return res.status(400).json({ message: 'Age must be between 1 and 120' });
    }

    if (!['male', 'female', 'other'].includes(gender.toLowerCase())) {
      return res.status(400).json({ message: 'Invalid gender' });
    }

    // Check if user already exists
    const existingUser = await googleSheetsService.getUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ message: 'User with this email already exists' });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user data object
    const userData = {
      fullName: fullName.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role,
      age: parseInt(age),
      gender: gender.toLowerCase()
    };

    // Save user to Google Sheets
    const newUser = await googleSheetsService.addUser(userData);

    // Generate JWT token
    const token = generateToken(newUser);

    res.status(201).json({ 
      message: 'Registration successful', 
      user: newUser,
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    if (error.message === 'User with this email already exists') {
      return res.status(409).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// Verify token route
router.get('/verify', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await googleSheetsService.getUserById(decoded.id);
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({ message: 'Invalid token' });
  }
});

module.exports = router;
