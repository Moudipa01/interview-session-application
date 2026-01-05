import Session from '../models/Session.js';
import User from '../models/User.js';

export const createSession = async (req, res) => {
  try {
    const { interviewerId, subject, scheduledAt } = req.body;

    if (req.user.role !== 'interviewee') {
      return res.status(403).json({ error: 'Only interviewees can create sessions' });
    }

    // Verify interviewer exists and is an interviewer
    const interviewer = await User.findById(interviewerId);
    if (!interviewer || interviewer.role !== 'interviewer') {
      return res.status(400).json({ error: 'Invalid interviewer' });
    }

    // Check if interviewer has the subject in their domains
    if (!interviewer.domains.includes(subject)) {
      return res.status(400).json({ error: 'Interviewer does not cover this subject' });
    }

    const session = new Session({
      intervieweeId: req.user._id,
      interviewerId,
      subject,
      scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
      status: 'pending',
    });

    await session.save();
    await session.populate('intervieweeId', 'fullName email');
    await session.populate('interviewerId', 'fullName email yearsOfExperience domains');

    res.status(201).json({ session });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getSessions = async (req, res) => {
  try {
    let query = {};

    if (req.user.role === 'interviewer') {
      query.interviewerId = req.user._id;
    } else {
      query.intervieweeId = req.user._id;
    }

    // Optional status filter
    if (req.query.status) {
      query.status = req.query.status;
    }

    const sessions = await Session.find(query)
      .populate('intervieweeId', 'fullName email')
      .populate('interviewerId', 'fullName email yearsOfExperience domains')
      .sort({ createdAt: -1 });

    res.json({ sessions });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getSession = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id)
      .populate('intervieweeId', 'fullName email')
      .populate('interviewerId', 'fullName email yearsOfExperience domains');

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // Verify user has access to this session
    const isParticipant =
      session.intervieweeId._id.toString() === req.user._id.toString() ||
      session.interviewerId._id.toString() === req.user._id.toString();

    if (!isParticipant) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({ session });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const acceptSession = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    if (session.interviewerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Only interviewer can accept sessions' });
    }

    if (session.status !== 'pending') {
      return res.status(400).json({ error: 'Session is not pending' });
    }

    session.status = 'accepted';
    await session.save();
    await session.populate('intervieweeId', 'fullName email');
    await session.populate('interviewerId', 'fullName email yearsOfExperience domains');

    res.json({ session });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const rejectSession = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    if (session.interviewerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Only interviewer can reject sessions' });
    }

    if (session.status !== 'pending') {
      return res.status(400).json({ error: 'Session is not pending' });
    }

    session.status = 'rejected';
    await session.save();
    await session.populate('intervieweeId', 'fullName email');
    await session.populate('interviewerId', 'fullName email yearsOfExperience domains');

    res.json({ session });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const startSession = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const isParticipant =
      session.intervieweeId.toString() === req.user._id.toString() ||
      session.interviewerId.toString() === req.user._id.toString();

    if (!isParticipant) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (session.status !== 'accepted') {
      return res.status(400).json({ error: 'Session must be accepted before starting' });
    }

    session.status = 'accepted'; // Keep as accepted, startedAt tracks actual start
    session.startedAt = new Date();
    await session.save();
    await session.populate('intervieweeId', 'fullName email');
    await session.populate('interviewerId', 'fullName email yearsOfExperience domains');

    res.json({ session });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const endSession = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const isParticipant =
      session.intervieweeId.toString() === req.user._id.toString() ||
      session.interviewerId.toString() === req.user._id.toString();

    if (!isParticipant) {
      return res.status(403).json({ error: 'Access denied' });
    }

    session.status = 'completed';
    session.endedAt = new Date();
    await session.save();
    await session.populate('intervieweeId', 'fullName email');
    await session.populate('interviewerId', 'fullName email yearsOfExperience domains');

    res.json({ session });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

