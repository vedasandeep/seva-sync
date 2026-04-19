import { z } from 'zod';

/**
 * Schema for incoming call webhook (Exotel/Twilio)
 * Triggered when a volunteer calls the SevaSync IVR number
 */
export const incomingCallSchema = z.object({
  // Exotel fields
  CallSid: z.string().optional(),
  From: z.string(), // Caller's phone number
  To: z.string(), // SevaSync IVR number
  CallStatus: z.string().optional(),
  Direction: z.enum(['inbound', 'outbound']).optional(),
  
  // Twilio fields (similar but slightly different naming)
  CallUuid: z.string().optional(),
  Caller: z.string().optional(),
  Called: z.string().optional(),
});

/**
 * Schema for DTMF digit collection (user pressed buttons)
 */
export const gatherInputSchema = z.object({
  CallSid: z.string().optional(),
  CallUuid: z.string().optional(),
  From: z.string(),
  Digits: z.string(), // DTMF digits pressed (e.g., "1", "23", "0")
  
  // Session context (passed as query params)
  sessionId: z.string().optional(),
  menuState: z.string().optional(), // Current menu state (main, task_list, wellness, etc.)
});

/**
 * Schema for call status updates
 */
export const callStatusSchema = z.object({
  CallSid: z.string().optional(),
  CallUuid: z.string().optional(),
  From: z.string(),
  To: z.string(),
  CallStatus: z.enum(['initiated', 'ringing', 'in-progress', 'completed', 'failed', 'busy', 'no-answer']),
  CallDuration: z.coerce.number().optional(),
  RecordingUrl: z.string().url().optional(),
});

/**
 * Schema for outbound call initiation (system calls volunteer)
 */
export const initiateCallSchema = z.object({
  phoneNumber: z.string().regex(/^\+\d{10,15}$/, 'Invalid phone number format (E.164)'),
  message: z.string().min(10).max(500),
  language: z.enum(['en', 'hi', 'ta', 'te', 'mr', 'bn']).default('en'),
  taskId: z.string().uuid().optional(), // If calling about a specific task
});

/**
 * Schema for voice recording submission (task update via voice)
 */
export const voiceRecordingSchema = z.object({
  CallSid: z.string().optional(),
  CallUuid: z.string().optional(),
  From: z.string(),
  RecordingUrl: z.string().url(),
  RecordingDuration: z.coerce.number(),
  taskId: z.string().uuid().optional(),
  volunteerId: z.string().uuid().optional(),
});

/**
 * Schema for IVR menu navigation
 */
export const menuStateSchema = z.object({
  sessionId: z.string().uuid(),
  state: z.enum([
    'main_menu',           // Main IVR menu
    'language_selection',  // Choose language
    'volunteer_auth',      // Authenticate volunteer
    'task_list',           // List available tasks
    'task_details',        // Hear task details
    'task_accept',         // Accept task confirmation
    'task_update',         // Update task status
    'wellness_checkin',    // Wellness check-in flow
    'help',                // Help menu
    'goodbye',             // Call ending
  ]),
  data: z.record(z.any()).optional(), // Additional state data (task IDs, selections, etc.)
  volunteerId: z.string().uuid().optional(),
  language: z.string().default('en'),
});

/**
 * Schema for wellness check-in via IVR
 */
export const ivrWellnessCheckinSchema = z.object({
  overallMood: z.coerce.number().int().min(1).max(10),
  physicalFatigue: z.coerce.number().int().min(1).max(10),
  emotionalStress: z.coerce.number().int().min(1).max(10),
  hoursWorkedToday: z.coerce.number().int().min(0).max(24),
  needsBreak: z.boolean().default(false),
});

/**
 * Schema for task acceptance via IVR
 */
export const ivrTaskAcceptSchema = z.object({
  taskId: z.string().uuid(),
  volunteerId: z.string().uuid(),
  acceptedViaIvr: z.boolean().default(true),
});

// Type exports
export type IncomingCallInput = z.infer<typeof incomingCallSchema>;
export type GatherInputInput = z.infer<typeof gatherInputSchema>;
export type CallStatusInput = z.infer<typeof callStatusSchema>;
export type InitiateCallInput = z.infer<typeof initiateCallSchema>;
export type VoiceRecordingInput = z.infer<typeof voiceRecordingSchema>;
export type MenuStateInput = z.infer<typeof menuStateSchema>;
export type IvrWellnessCheckinInput = z.infer<typeof ivrWellnessCheckinSchema>;
export type IvrTaskAcceptInput = z.infer<typeof ivrTaskAcceptSchema>;
