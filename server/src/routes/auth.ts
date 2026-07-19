import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { protect, AuthRequest } from '../middleware/authMiddleware.js';

const router = Router();

// Helper to generate JWT
const generateToken = (id: string) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'supersecretkey', {
    expiresIn: '30d'
  });
};

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', async (req: any, res: any) => {
  try {
    const {
      name,
      email,
      password,
      dob,
      gender,
      height,
      weight,
      activityLevel,
      pregnancyStatus,
      primaryGoal,
      healthPriorities,
      dietType,
      dietaryRestrictions
    } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user in DB
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      dob,
      gender,
      height,
      weight,
      activityLevel,
      pregnancyStatus,
      primaryGoal,
      healthPriorities,
      dietType,
      dietaryRestrictions
    });

    if (user) {
      res.status(201).json({
        token: generateToken(user._id.toString()),
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          dob: user.dob,
          gender: user.gender,
          height: user.height,
          weight: user.weight,
          activityLevel: user.activityLevel,
          pregnancyStatus: user.pregnancyStatus,
          primaryGoal: user.primaryGoal,
          healthPriorities: user.healthPriorities,
          dietType: user.dietType,
          dietaryRestrictions: user.dietaryRestrictions
        }
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({
      message: 'Server error during registration',
      error: error instanceof Error ? error.message : error
    });
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', async (req: any, res: any) => {
  try {
    const { email, password } = req.body;

    // Check for user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    res.json({
      token: generateToken(user._id.toString()),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        dob: user.dob,
        gender: user.gender,
        height: user.height,
        weight: user.weight,
        activityLevel: user.activityLevel,
        pregnancyStatus: user.pregnancyStatus,
        primaryGoal: user.primaryGoal,
        healthPriorities: user.healthPriorities,
        dietType: user.dietType,
        dietaryRestrictions: user.dietaryRestrictions
      }
    });
  } catch (error) {
    res.status(500).json({
      message: 'Server error during login',
      error: error instanceof Error ? error.message : error
    });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user profile
// @access  Private
router.get('/me', protect, async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({
      message: 'Server error during fetching profile',
      error: error instanceof Error ? error.message : error
    });
  }
});

export default router;
