import express from 'express';
import {
  createSession,
  getSessions,
  getSession,
  acceptSession,
  rejectSession,
  startSession,
  endSession,
} from '../controllers/sessionController.js';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/roleGuard.js';

const router = express.Router();

router.use(authenticate);

router.post('/', requireRole('interviewee'), createSession);
router.get('/', getSessions);
router.get('/:id', getSession);
router.put('/:id/accept', requireRole('interviewer'), acceptSession);
router.put('/:id/reject', requireRole('interviewer'), rejectSession);
router.put('/:id/start', startSession);
router.put('/:id/end', endSession);

export default router;

