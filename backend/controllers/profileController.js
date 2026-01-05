import User from '../models/User.js';

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ user: user.toJSON() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { fullName, location, ...roleSpecificData } = req.body;
    const updates = {};

    if (fullName) updates.fullName = fullName;
    if (location) {
      updates.location = {
        type: 'Point',
        coordinates: [location.lng, location.lat],
      };
    }

    // Update role-specific fields
    if (req.user.role === 'interviewer') {
      if (roleSpecificData.yearsOfExperience !== undefined) {
        updates.yearsOfExperience = roleSpecificData.yearsOfExperience;
      }
      if (roleSpecificData.domains) {
        updates.domains = roleSpecificData.domains;
      }
      if (roleSpecificData.availabilityRadius !== undefined) {
        updates.availabilityRadius = roleSpecificData.availabilityRadius;
      }
    } else if (req.user.role === 'interviewee') {
      if (roleSpecificData.currentStatus) {
        updates.currentStatus = roleSpecificData.currentStatus;
      }
      if (roleSpecificData.yearOfStudy !== undefined) {
        updates.yearOfStudy = roleSpecificData.yearOfStudy;
      }
      if (roleSpecificData.domain) {
        updates.domain = roleSpecificData.domain;
      }
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    res.json({ user: user.toJSON() });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

