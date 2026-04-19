import { Request, Response } from 'express';
import * as ivrService from '../services/ivr.service';
import { ExotelResponse, getMessage, buildTaskDescription } from '../utils/twiml';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const LANG = 'hi'; // Default to Hindi for Indian volunteers

/**
 * Handle incoming call from Exotel
 * POST /api/ivr/incoming
 * 
 * Flow:
 * 1. Extract caller's phone number
 * 2. Authenticate volunteer by phone
 * 3. If not registered -> goodbye message
 * 4. If has active task -> prompt to complete
 * 5. If no active task -> find nearest task and prompt to accept
 */
export async function handleIncomingCall(req: Request, res: Response) {
  const callSid = req.body.CallSid || req.body.CallUuid || 'unknown';
  const phoneNumber = req.body.From || req.body.Caller;
  
  console.log(`[IVR] Incoming call: ${callSid} from ${phoneNumber}`);
  
  const response = new ExotelResponse();
  
  try {
    // 1. Authenticate volunteer
    const volunteer = await ivrService.authenticateByPhone(phoneNumber);
    
    if (!volunteer) {
      // Not registered
      await ivrService.logIvrCall({
        callSid,
        direction: 'inbound',
        phoneNumber,
        action: 'auth_failed',
        success: false,
        errorMessage: 'Phone not registered',
      });
      
      response
        .say(getMessage('welcome', LANG))
        .pause(1)
        .say(getMessage('notRegistered', LANG))
        .hangup();
      
      return res.type('text/xml').send(response.build());
    }
    
    // Log successful auth
    await ivrService.logIvrCall({
      volunteerId: volunteer.id,
      callSid,
      direction: 'inbound',
      phoneNumber,
      action: 'auth_success',
      success: true,
    });
    
    // Update activity
    await ivrService.updateVolunteerActivity(volunteer.id);
    
    // 2. Check for active task
    const activeTask = await ivrService.getActiveTask(volunteer.id);
    
    if (activeTask) {
      // Has active task - prompt to complete
      const taskDesc = buildTaskDescription({
        title: activeTask.title,
        description: activeTask.description || undefined,
        urgency: activeTask.urgency,
        estimatedHours: activeTask.estimatedHours || undefined,
      }, LANG);
      
      response
        .say(getMessage('welcome', LANG))
        .pause(1)
        .say(getMessage('taskAlreadyAssigned', LANG))
        .pause(1)
        .say(taskDesc)
        .gather({
          action: `${BASE_URL}/api/ivr/gather?volunteerId=${volunteer.id}&taskId=${activeTask.id}&menu=active_task`,
          numDigits: 1,
          timeout: 10,
        })
        .say(getMessage('taskOptions', LANG).replace('accept', 'complete'))
        .endGather()
        .say(getMessage('goodbye', LANG))
        .hangup();
      
      return res.type('text/xml').send(response.build());
    }
    
    // 3. Find nearest task
    const task = await ivrService.getNearestTask(volunteer.id);
    
    if (!task) {
      // No tasks available
      await ivrService.logIvrCall({
        volunteerId: volunteer.id,
        callSid,
        direction: 'inbound',
        phoneNumber,
        action: 'no_tasks',
        success: true,
      });
      
      response
        .say(getMessage('welcome', LANG))
        .pause(1)
        .say(getMessage('noTasks', LANG))
        .hangup();
      
      return res.type('text/xml').send(response.build());
    }
    
    // 4. Present task to volunteer
    const taskDesc = buildTaskDescription({
      title: task.title,
      description: task.description || undefined,
      urgency: task.urgency,
      estimatedHours: task.estimatedHours || undefined,
    }, LANG);
    
    response
      .say(getMessage('welcome', LANG))
      .pause(1)
      .say(getMessage('taskIntro', LANG))
      .pause(1)
      .say(taskDesc)
      .pause(1)
      .gather({
        action: `${BASE_URL}/api/ivr/gather?volunteerId=${volunteer.id}&taskId=${task.id}&menu=new_task`,
        numDigits: 1,
        timeout: 10,
      })
      .say(getMessage('taskOptions', LANG))
      .endGather()
      .say(getMessage('goodbye', LANG))
      .hangup();
    
    return res.type('text/xml').send(response.build());
    
  } catch (error) {
    console.error('[IVR] Error in incoming call:', error);
    
    await ivrService.logIvrCall({
      callSid,
      direction: 'inbound',
      phoneNumber,
      action: 'error',
      success: false,
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
    });
    
    response
      .say(getMessage('error', LANG))
      .hangup();
    
    return res.type('text/xml').send(response.build());
  }
}

/**
 * Handle DTMF digit input from caller
 * POST /api/ivr/gather
 * 
 * Query params: volunteerId, taskId, menu (new_task|active_task)
 * Body: Digits (1, 2, or 9)
 */
export async function handleGatherInput(req: Request, res: Response) {
  const { volunteerId, taskId, menu } = req.query as Record<string, string>;
  const digits = req.body.Digits;
  const callSid = req.body.CallSid || req.body.CallUuid || 'unknown';
  const phoneNumber = req.body.From || req.body.Caller;
  
  console.log(`[IVR] Gather input: ${digits} from volunteer ${volunteerId}, menu: ${menu}`);
  
  const response = new ExotelResponse();
  
  try {
    // Handle different menu states
    if (menu === 'new_task') {
      // New task menu: 1=accept, 2=skip, 9=repeat
      switch (digits) {
        case '1':
          // Accept task
          await ivrService.acceptTaskViaIvr(taskId, volunteerId);
          
          await ivrService.logIvrCall({
            volunteerId,
            callSid,
            direction: 'inbound',
            phoneNumber,
            action: 'task_accepted',
            success: true,
          });
          
          response
            .say(getMessage('taskAccepted', LANG))
            .hangup();
          break;
          
        case '2':
          // Skip task
          await ivrService.logIvrCall({
            volunteerId,
            callSid,
            direction: 'inbound',
            phoneNumber,
            action: 'task_skipped',
            success: true,
          });
          
          response
            .say(getMessage('taskSkipped', LANG))
            .hangup();
          break;
          
        case '9':
          // Repeat - redirect back to incoming
          response.redirect(`${BASE_URL}/api/ivr/incoming`);
          break;
          
        default:
          // Invalid input
          response
            .say(getMessage('invalidInput', LANG))
            .redirect(`${BASE_URL}/api/ivr/incoming`);
      }
    } else if (menu === 'active_task') {
      // Active task menu: 1=complete, 2=hear details
      switch (digits) {
        case '1':
          // Complete task
          await ivrService.completeTaskViaIvr(taskId, volunteerId);
          
          await ivrService.logIvrCall({
            volunteerId,
            callSid,
            direction: 'inbound',
            phoneNumber,
            action: 'task_completed',
            success: true,
          });
          
          response
            .say(getMessage('taskCompleted', LANG))
            .hangup();
          break;
          
        case '2':
          // Hear details - redirect back
          response.redirect(`${BASE_URL}/api/ivr/incoming`);
          break;
          
        default:
          response
            .say(getMessage('invalidInput', LANG))
            .redirect(`${BASE_URL}/api/ivr/incoming`);
      }
    } else {
      // Unknown menu state
      response
        .say(getMessage('error', LANG))
        .hangup();
    }
    
    return res.type('text/xml').send(response.build());
    
  } catch (error) {
    console.error('[IVR] Error in gather:', error);
    
    await ivrService.logIvrCall({
      volunteerId,
      callSid,
      direction: 'inbound',
      phoneNumber,
      action: 'gather_error',
      success: false,
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
    });
    
    response
      .say(getMessage('error', LANG))
      .hangup();
    
    return res.type('text/xml').send(response.build());
  }
}

/**
 * Handle call status updates from Exotel
 * POST /api/ivr/status
 */
export async function handleCallStatus(req: Request, res: Response) {
  const { CallSid, CallUuid, From, CallStatus, CallDuration } = req.body;
  const callSid = CallSid || CallUuid;
  
  console.log(`[IVR] Call status update: ${callSid} - ${CallStatus}`);
  
  // Log if call ended
  if (['completed', 'failed', 'busy', 'no-answer'].includes(CallStatus)) {
    try {
      // Find volunteer by phone if possible
      const volunteer = await ivrService.authenticateByPhone(From);
      
      await ivrService.logIvrCall({
        volunteerId: volunteer?.id,
        callSid,
        direction: 'inbound',
        phoneNumber: From,
        action: `call_${CallStatus}`,
        success: CallStatus === 'completed',
        durationSeconds: CallDuration ? parseInt(CallDuration) : undefined,
      });
    } catch (error) {
      console.error('[IVR] Error logging call status:', error);
    }
  }
  
  // Exotel expects 200 OK
  res.status(200).send('OK');
}
