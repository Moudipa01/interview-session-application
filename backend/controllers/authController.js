import User from '../models/User.js';
import { generateToken } from '../config/jwt.js';

export const register = async (req, res) => {
  try {
    const { email, password, fullName, role, location, ...roleSpecificData } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Build user data
    const userData = {
      email,
      password,
      fullName,
      role,
      location: {
        type: 'Point',
        coordinates: [location.lng, location.lat],
      },
    };

    // Add role-specific fields
    if (role === 'interviewer') {
      userData.yearsOfExperience = roleSpecificData.yearsOfExperience;
      userData.domains = roleSpecificData.domains;
      userData.availabilityRadius = roleSpecificData.availabilityRadius || 5;
    } else if (role === 'interviewee') {
      userData.currentStatus = roleSpecificData.currentStatus;
      if (roleSpecificData.currentStatus === 'student') {
        userData.yearOfStudy = roleSpecificData.yearOfStudy;
      } else {
        userData.domain = roleSpecificData.domain;
      }
    }

    const user = new User(userData);
    await user.save();

    const token = generateToken(user._id);

    res.status(201).json({
      token,
      user: user.toJSON(),
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken(user._id);

    res.json({
      token,
      user: user.toJSON(),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getMe = async (req, res) => {
  res.json({ user: req.user });
};

