import { Router } from 'express';
import * as ivrController from '../controllers/ivr.controller';

const router = Router();

/**
 * IVR Webhook Routes
 * These endpoints are called by Exotel/Twilio, NOT authenticated via JWT
 * Security: Validate webhook signatures in production (TODO)
 */

/**
 * @route   POST /api/ivr/incoming
 * @desc    Handle incoming calls - authenticate & present tasks
 * @access  Public (Exotel webhook)
 */
router.post('/incoming', ivrController.handleIncomingCall);

/**
 * @route   POST /api/ivr/gather
 * @desc    Handle DTMF digit input (1=accept, 2=skip, 9=repeat)
 * @access  Public (Exotel webhook)
 */
router.post('/gather', ivrController.handleGatherInput);

/**
 * @route   POST /api/ivr/status
 * @desc    Handle call status updates (completed, failed, etc.)
 * @access  Public (Exotel webhook)
 */
router.post('/status', ivrController.handleCallStatus);

export default router;
