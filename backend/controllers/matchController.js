import User from '../models/User.js';
import Session from '../models/Session.js';

export const findInterviewers = async (req, res) => {
  try {
    const { subject, radius = 5, lat, lng } = req.query;

    if (!subject || !lat || !lng) {
      return res.status(400).json({ error: 'Subject, lat, and lng are required' });
    }

    const radiusInMeters = parseFloat(radius) * 1000; // Convert km to meters

    // Geospatial query to find interviewers within radius
    const interviewers = await User.find({
      role: 'interviewer',
      domains: { $in: [subject] },
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)],
          },
          $maxDistance: radiusInMeters,
        },
      },
    }).select('-password');

    // Get pending/accepted sessions for each interviewer to show availability
    const interviewerIds = interviewers.map((i) => i._id);
    const activeSessions = await Session.find({
      interviewerId: { $in: interviewerIds },
      status: { $in: ['pending', 'accepted'] },
    });

    const sessionCounts = {};
    activeSessions.forEach((session) => {
      const id = session.interviewerId.toString();
      sessionCounts[id] = (sessionCounts[id] || 0) + 1;
    });

    const results = interviewers.map((interviewer) => ({
      ...interviewer.toJSON(),
      activeSessions: sessionCounts[interviewer._id.toString()] || 0,
    }));

    res.json({ interviewers: results });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

