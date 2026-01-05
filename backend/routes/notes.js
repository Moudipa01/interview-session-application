import express from 'express';
import { createOrUpdateNote, getNotes } from '../controllers/noteController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router({ mergeParams: true });

router.use(authenticate);

// Mounted at /api/sessions, so these become:
// POST /api/sessions/:sessionId/notes
// GET /api/sessions/:sessionId/notes
router.post('/:sessionId/notes', createOrUpdateNote);
router.get('/:sessionId/notes', getNotes);

export default router;

