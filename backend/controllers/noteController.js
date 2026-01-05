import Note from '../models/Note.js';
import Session from '../models/Session.js';

export const createOrUpdateNote = async (req, res) => {
  try {
    const { content } = req.body;
    const { sessionId } = req.params;

    // Verify session exists and user is a participant
    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const isParticipant =
      session.intervieweeId.toString() === req.user._id.toString() ||
      session.interviewerId.toString() === req.user._id.toString();

    if (!isParticipant) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Find existing note by this author for this session, or create new
    let note = await Note.findOne({
      sessionId,
      authorId: req.user._id,
    });

    if (note) {
      note.content = content;
      await note.save();
    } else {
      note = new Note({
        sessionId,
        authorId: req.user._id,
        content,
      });
      await note.save();
    }

    await note.populate('authorId', 'fullName email role');

    res.json({ note });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getNotes = async (req, res) => {
  try {
    const { sessionId } = req.params;

    // Verify session exists and user is a participant
    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const isParticipant =
      session.intervieweeId.toString() === req.user._id.toString() ||
      session.interviewerId.toString() === req.user._id.toString();

    if (!isParticipant) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const notes = await Note.find({ sessionId }).populate(
      'authorId',
      'fullName email role'
    );

    res.json({ notes });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

