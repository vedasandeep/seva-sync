import { Router } from 'express';
import * as ivrController from './ivr.controller';
import * as ivrAnalyticsController from './ivr-analytics.controller';

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

/**
 * IVR Call Operations
 * These are authenticated endpoints for managing calls
 */

/**
 * @route   POST /api/ivr/call/initiate
 * @desc    Initiate an outbound call to a volunteer
 * @access  Private (Authenticated)
 */
router.post('/call/initiate', ivrController.initiateCall);

/**
 * @route   GET /api/ivr/call/:callSid
 * @desc    Get details of a specific call
 * @access  Private (Authenticated)
 */
router.get('/call/:callSid', ivrController.getCallDetails);

/**
 * @route   POST /api/ivr/call/:callSid/hangup
 * @desc    Terminate an active call
 * @access  Private (Authenticated)
 */
router.post('/call/:callSid/hangup', ivrController.hangupCall);

/**
 * @route   POST /api/ivr/call/:callSid/dtmf
 * @desc    Send DTMF digits to an active call
 * @access  Private (Authenticated)
 */
router.post('/call/:callSid/dtmf', ivrController.sendDtmf);

/**
 * IVR Analytics Routes
 * These are authenticated endpoints for dashboard/reporting
 */

/**
 * @route   GET /api/ivr/analytics
 * @desc    Get overall IVR analytics and metrics
 * @access  Private (Authenticated)
 */
router.get('/analytics', ivrAnalyticsController.getIvrAnalytics);

/**
 * @route   GET /api/ivr/calls
 * @desc    Get recent IVR calls with optional filtering
 * @access  Private (Authenticated)
 */
router.get('/calls', ivrAnalyticsController.getRecentCalls);

/**
 * @route   GET /api/ivr/calls/:volunteerId
 * @desc    Get IVR calls for a specific volunteer
 * @access  Private (Authenticated)
 */
router.get('/calls/:volunteerId', ivrAnalyticsController.getVolunteerCalls);

/**
 * @route   GET /api/ivr/statistics
 * @desc    Get detailed call statistics for a date range
 * @access  Private (Authenticated)
 */
router.get('/statistics', ivrAnalyticsController.getCallStatistics);

/**
 * @route   GET /api/ivr/adoption
 * @desc    Get IVR adoption metrics
 * @access  Private (Authenticated)
 */
router.get('/adoption', ivrAnalyticsController.getAdoptionMetrics);

export default router;
