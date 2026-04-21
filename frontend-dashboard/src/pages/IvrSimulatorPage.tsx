import { useState } from 'react';
import {
  DashboardSection,
  DashboardGrid,
  WidgetCard,
} from '../components/dashboard';
import { Phone, PhoneMissed, PhoneOff, Mic } from 'lucide-react';
import IVRCallTimeline from '../features/ivr/components/IVRCallTimeline';

/**
 * IVR Simulator Page
 * Allows testing IVR system by simulating incoming calls
 * Feature-phone users can simulate pressing keypad digits
 */

interface CallState {
  status: 'idle' | 'ringing' | 'active' | 'completed' | 'failed';
  volunteerId?: string;
  volunteerName?: string;
  callDuration: number;
  inputDigits: string;
  selectedAction?: string;
  callSid?: string;
  timestamp?: Date;
}

interface TimelineEvent {
  id: string;
  type: 'call_start' | 'dial_tone' | 'ivr_prompt' | 'digit_input' | 'action_selected' | 'call_end';
  message: string;
  timestamp: Date;
  data?: any;
}

const MOCK_VOLUNTEERS = [
  {
    id: 'vol-001',
    name: 'Priya Singh',
    phone: '+919876543210',
    language: 'hi',
  },
  {
    id: 'vol-002',
    name: 'Rohan Kumar',
    phone: '+919876543211',
    language: 'en',
  },
  {
    id: 'vol-003',
    name: 'Anita Sharma',
    phone: '+919876543212',
    language: 'hi',
  },
];

const IVR_ACTIONS = [
  { digit: '1', label: 'Get Nearby Tasks', action: 'get_tasks' },
  { digit: '2', label: 'Log Work Hours', action: 'log_hours' },
  { digit: '3', label: 'Wellness Check-in', action: 'wellness_checkin' },
  { digit: '0', label: 'Disconnect Call', action: 'disconnect' },
];

export default function IvrSimulatorPage() {
  const [callState, setCallState] = useState<CallState>({
    status: 'idle',
    callDuration: 0,
    inputDigits: '',
  });

  const [selectedVolunteer, setSelectedVolunteer] = useState<string>(MOCK_VOLUNTEERS[0].id);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);

  // Start an incoming call
  const handleIncomingCall = async () => {
    const volunteer = MOCK_VOLUNTEERS.find((v) => v.id === selectedVolunteer);
    if (!volunteer) return;

    const callSid = `CA-${Date.now()}`;
    
    setCallState({
      status: 'ringing',
      volunteerId: volunteer.id,
      volunteerName: volunteer.name,
      callDuration: 0,
      inputDigits: '',
      callSid,
      timestamp: new Date(),
    });

    addTimelineEvent('call_start', `Incoming call from simulator to ${volunteer.name}`);

    // Simulate call connection after 2 seconds
    setTimeout(() => {
      setCallState((prev) => ({
        ...prev,
        status: 'active',
      }));
      addTimelineEvent(
        'ivr_prompt',
        `IVR: "Press 1 for tasks, 2 to log hours, 3 for wellness check, 0 to disconnect"`
      );
      startCallTimer();
    }, 2000);
  };

  // Handle digit press (keypad simulation)
  const handleDigitPress = (digit: string) => {
    if (callState.status !== 'active') return;

    setCallState((prev) => ({
      ...prev,
      inputDigits: prev.inputDigits + digit,
    }));

    addTimelineEvent('digit_input', `User pressed: ${digit}`);
  };

  // Handle action selection
  const handleActionSelect = (action: string) => {
    if (callState.status !== 'active') return;

    const actionConfig = IVR_ACTIONS.find((a) => a.action === action);
    if (!actionConfig) return;

    setCallState((prev) => ({
      ...prev,
      selectedAction: action,
    }));

    addTimelineEvent('action_selected', `Action selected: ${actionConfig.label}`);

    // Simulate action processing
    setTimeout(() => {
      addTimelineEvent(
        'ivr_prompt',
        `Processing: ${actionConfig.label} for ${callState.volunteerName}`
      );
    }, 800);
  };

  // End call
  const handleEndCall = () => {
    setCallState((prev) => ({
      ...prev,
      status: 'completed',
    }));
    addTimelineEvent('call_end', `Call ended after ${callState.callDuration} seconds`);
  };

  // Reject call
  const handleRejectCall = () => {
    setCallState((prev) => ({
      ...prev,
      status: 'failed',
    }));
    addTimelineEvent('call_end', 'Call rejected by volunteer');
  };

  // Clear call state
  const handleClearCall = () => {
    setCallState({
      status: 'idle',
      callDuration: 0,
      inputDigits: '',
    });
    setTimeline([]);
  };

  // Add event to timeline
  const addTimelineEvent = (type: TimelineEvent['type'], message: string, data?: any) => {
    const event: TimelineEvent = {
      id: `event-${Date.now()}`,
      type,
      message,
      timestamp: new Date(),
      data,
    };
    setTimeline((prev) => [event, ...prev]);
  };

  // Start call timer
  const startCallTimer = () => {
    const interval = setInterval(() => {
      setCallState((prev) => {
        if (prev.status === 'active') {
          return {
            ...prev,
            callDuration: prev.callDuration + 1,
          };
        }
        clearInterval(interval);
        return prev;
      });
    }, 1000);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <DashboardSection>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">IVR Simulator</h1>
        <p className="text-gray-600 mt-2">
          Simulate incoming IVR calls to test feature-phone volunteer workflows
        </p>
      </div>

      <DashboardGrid cols={1} gap="lg">
        {/* Call Controls */}
        <WidgetCard>
          <div className="p-4 sm:p-6 border-b border-slate-200">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Call Setup</h2>
          </div>
          <div className="p-4 sm:p-6">
            <div className="space-y-4">
              {/* Volunteer Selection */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                  Select Volunteer
                </label>
                <select
                  value={selectedVolunteer}
                  onChange={(e) => setSelectedVolunteer(e.target.value)}
                  disabled={callState.status !== 'idle'}
                  className="w-full px-3 sm:px-4 py-2 border border-slate-300 rounded-lg bg-white text-sm text-gray-900 disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  {MOCK_VOLUNTEERS.map((vol) => (
                    <option key={vol.id} value={vol.id}>
                      {vol.name} ({vol.phone})
                    </option>
                  ))}
                </select>
              </div>

              {/* Call Status */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                  Call Status
                </label>
                <div className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-gray-50 rounded-lg border border-slate-200">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      callState.status === 'idle'
                        ? 'bg-gray-400'
                        : callState.status === 'ringing'
                        ? 'bg-yellow-500 animate-pulse'
                        : callState.status === 'active'
                        ? 'bg-green-500 animate-pulse'
                        : callState.status === 'completed'
                        ? 'bg-blue-500'
                        : 'bg-red-500'
                    }`}
                  />
                  <span className="text-gray-700 font-medium capitalize text-sm">
                    {callState.status}
                  </span>
                  {callState.status === 'active' && (
                    <span className="ml-auto text-xs text-gray-600">
                      {formatDuration(callState.callDuration)}
                    </span>
                  )}
                </div>
              </div>

              {/* Call Actions */}
              <div className="space-y-2">
                {callState.status === 'idle' ? (
                  <button
                    onClick={handleIncomingCall}
                    className="w-full flex items-center justify-center gap-2 px-3 sm:px-4 py-2 sm:py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-sm"
                  >
                    <Phone size={16} />
                    Start Call
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handleEndCall}
                      className="w-full flex items-center justify-center gap-2 px-3 sm:px-4 py-2 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
                    >
                      <PhoneOff size={16} />
                      End Call
                    </button>
                    {callState.status === 'ringing' && (
                      <button
                        onClick={handleRejectCall}
                        className="w-full flex items-center justify-center gap-2 px-3 sm:px-4 py-2 sm:py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium text-sm"
                      >
                        <PhoneMissed size={16} />
                        Reject
                      </button>
                    )}
                    <button
                      onClick={handleClearCall}
                      className="w-full px-3 sm:px-4 py-2 text-sm bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-medium"
                    >
                      Reset
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </WidgetCard>

        {/* IVR Keypad */}
        <WidgetCard>
          <div className="p-4 sm:p-6 border-b border-slate-200">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">IVR Keypad</h2>
          </div>
          <div className="p-4 sm:p-6">
            <div className="space-y-4">
              {/* Display */}
              <div className="bg-gray-900 text-green-400 rounded-lg p-3 sm:p-4 font-mono text-center min-h-[60px] sm:min-h-[80px] flex flex-col justify-center border-2 border-green-400">
                <div className="text-xs text-gray-500 mb-1">Input:</div>
                <div className="text-lg sm:text-2xl font-bold tracking-wider">
                  {callState.inputDigits || '---'}
                </div>
              </div>

              {/* Keypad Grid */}
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'].map((digit) => (
                  <button
                    key={digit}
                    onClick={() => handleDigitPress(digit)}
                    disabled={callState.status !== 'active'}
                    className="py-3 sm:py-4 bg-slate-200 text-gray-900 rounded-lg font-bold text-base sm:text-lg hover:bg-slate-300 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
                  >
                    {digit}
                  </button>
                ))}
              </div>

              {/* Microphone */}
              <button
                disabled={callState.status !== 'active'}
                className="w-full flex items-center justify-center gap-2 px-3 sm:px-4 py-2 sm:py-3 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors font-medium text-sm"
              >
                <Mic size={16} />
                Voice (Mock)
              </button>
            </div>
          </div>
        </WidgetCard>

        {/* Action Selection */}
        <WidgetCard>
          <div className="p-4 sm:p-6 border-b border-slate-200">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Available Actions</h2>
          </div>
          <div className="p-4 sm:p-6">
            <div className="space-y-2">
              {IVR_ACTIONS.map((action) => (
                <button
                  key={action.digit}
                  onClick={() => handleActionSelect(action.action)}
                  disabled={callState.status !== 'active'}
                  className={`w-full text-left px-3 sm:px-4 py-2 sm:py-3 rounded-lg border-2 transition-colors font-medium text-sm ${
                    callState.selectedAction === action.action
                      ? 'bg-blue-50 border-blue-500 text-blue-700'
                      : 'border-slate-200 text-gray-700 hover:border-slate-300 disabled:bg-gray-50 disabled:cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{action.label}</span>
                    <span className="text-xs bg-slate-200 px-2 py-1 rounded font-mono">
                      {action.digit}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </WidgetCard>

        {/* Call Timeline */}
        <WidgetCard>
          <div className="p-4 sm:p-6 border-b border-slate-200">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Call Timeline</h2>
          </div>
          <div className="p-4 sm:p-6">
            <IVRCallTimeline events={timeline} />
          </div>
        </WidgetCard>
      </DashboardGrid>
    </DashboardSection>
  );
}
