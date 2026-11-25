
import User from '../models/User.js';
import jwt from 'jsonwebtoken';

// Generate JWT token
const generateToken = (id) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured');
  }

  return jwt.sign(
    { id },
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  );
};

// Register a new student
export const register = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      rollNumber,
      department,
      graduationYear,
      cgpa,
      backlogs,
    } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        message: 'Name, email and password are required',
      });
    }

    // Normalize email
    const normalizedEmail = email.trim().toLowerCase();

    // Check if user already exists
    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(400).json({
        message: 'User with this email already exists',
      });
    }

    // Create student account (public registration cannot create admins)
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
      role: 'STUDENT',
      rollNumber,
      department,
      graduationYear: graduationYear ? Number(graduationYear) : undefined,
      cgpa: cgpa !== undefined ? Number(cgpa) : undefined,
      backlogs: backlogs !== undefined ? Number(backlogs) : 0,
    });

    // Generate token
    const token = generateToken(user._id);

    // Return response
    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        rollNumber: user.rollNumber,
        department: user.department,
        graduationYear: user.graduationYear,
        cgpa: user.cgpa,
        backlogs: user.backlogs,
        personalEmail: user.personalEmail,
        contactNumber: user.contactNumber,
        resumeUrl: user.resumeUrl,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Login existing user
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        message: 'Please provide email and password',
      });
    }

    // Normalize email
    const normalizedEmail = email.trim().toLowerCase();

    // Find user
    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return res.status(401).json({
        message: 'Invalid credentials',
      });
    }

    // Verify password
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        message: 'Invalid credentials',
      });
    }

    // Generate token
    const token = generateToken(user._id);

    // Return response
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        rollNumber: user.rollNumber,
        department: user.department,
        graduationYear: user.graduationYear,
        cgpa: user.cgpa,
        backlogs: user.backlogs,
        personalEmail: user.personalEmail,
        contactNumber: user.contactNumber,
        resumeUrl: user.resumeUrl,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Get currently logged-in user
export const getMe = async (req, res) => {
  res.json({
    user: req.user,
  });
};
