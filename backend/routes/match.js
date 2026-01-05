import express from 'express';
import { findInterviewers } from '../controllers/matchController.js';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/roleGuard.js';

const router = express.Router();

router.use(authenticate);
router.use(requireRole('interviewee'));

router.get('/interviewers', findInterviewers);

export default router;

