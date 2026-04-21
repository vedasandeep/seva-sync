import { Phone, MessageSquare, CheckCircle, AlertCircle } from 'lucide-react';

interface IVRFlowDiagramProps {
  compact?: boolean;
}

export default function IVRFlowDiagram({ compact = false }: IVRFlowDiagramProps) {
  if (compact) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
            <Phone size={20} className="text-green-600" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-gray-900">Incoming Call</p>
            <p className="text-xs text-gray-600">Volunteer receives call</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
            <MessageSquare size={20} className="text-blue-600" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-gray-900">IVR Prompt</p>
            <p className="text-xs text-gray-600">Press 1, 2, or 3 for actions</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
            <MessageSquare size={20} className="text-amber-600" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-gray-900">Action Processing</p>
            <p className="text-xs text-gray-600">Get tasks, log hours, or wellness</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle size={20} className="text-green-600" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-gray-900">Confirmation</p>
            <p className="text-xs text-gray-600">Action confirmed, call logged</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Flow Title */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">IVR Call Flow</h2>
        <p className="text-sm text-gray-600 mb-6">
          Shows the typical flow when a volunteer receives an IVR call from the system
        </p>
      </div>

      {/* SVG Flow Diagram */}
      <svg
        viewBox="0 0 800 600"
        className="w-full border border-slate-200 rounded-lg bg-white p-4"
      >
        {/* Start Circle */}
        <circle cx="400" cy="50" r="30" fill="#10b981" />
        <text x="400" y="55" textAnchor="middle" className="text-sm font-bold fill-white">
          START
        </text>

        {/* Arrow 1 */}
        <line x1="400" y1="80" x2="400" y2="120" stroke="#cbd5e1" strokeWidth="2" />

        {/* Call Incoming */}
        <rect x="300" y="120" width="200" height="80" fill="#dbeafe" stroke="#3b82f6" strokeWidth="2" rx="8" />
        <circle cx="330" cy="155" r="20" fill="#3b82f6" />
        <text x="330" y="161" textAnchor="middle" className="text-xs font-bold fill-white">
          ☎
        </text>
        <text x="440" y="150" className="text-sm font-bold fill-gray-900">
          Incoming Call
        </text>
        <text x="440" y="170" className="text-xs fill-gray-600">
          from SevaSync System
        </text>
        <text x="440" y="188" className="text-xs fill-gray-600">
          to Volunteer Phone
        </text>

        {/* Arrow 2 */}
        <line x1="400" y1="200" x2="400" y2="240" stroke="#cbd5e1" strokeWidth="2" />

        {/* Authentication */}
        <rect x="300" y="240" width="200" height="80" fill="#fef3c7" stroke="#f59e0b" strokeWidth="2" rx="8" />
        <circle cx="330" cy="275" r="20" fill="#f59e0b" />
        <text x="330" y="281" textAnchor="middle" className="text-xs font-bold fill-white">
          ✓
        </text>
        <text x="440" y="270" className="text-sm font-bold fill-gray-900">
          Authenticate Volunteer
        </text>
        <text x="440" y="290" className="text-xs fill-gray-600">
          Verify phone number
        </text>
        <text x="440" y="308" className="text-xs fill-gray-600">
          Hash & secure validation
        </text>

        {/* Arrow 3 */}
        <line x1="400" y1="320" x2="400" y2="360" stroke="#cbd5e1" strokeWidth="2" />

        {/* IVR Prompt */}
        <rect x="300" y="360" width="200" height="100" fill="#dbeafe" stroke="#3b82f6" strokeWidth="2" rx="8" />
        <circle cx="330" cy="405" r="20" fill="#3b82f6" />
        <text x="330" y="411" textAnchor="middle" className="text-xs font-bold fill-white">
          ♪
        </text>
        <text x="440" y="390" className="text-sm font-bold fill-gray-900">
          Play IVR Menu
        </text>
        <text x="440" y="410" className="text-xs fill-gray-600">
          Press 1: Get Tasks
        </text>
        <text x="440" y="428" className="text-xs fill-gray-600">
          Press 2: Log Hours | Press 3: Wellness
        </text>

        {/* Arrow 4 - Left */}
        <path
          d="M 300 410 Q 200 410 150 480"
          stroke="#cbd5e1"
          strokeWidth="2"
          fill="none"
        />

        {/* Arrow 4 - Center */}
        <line x1="400" y1="460" x2="400" y2="500" stroke="#cbd5e1" strokeWidth="2" />

        {/* Arrow 4 - Right */}
        <path
          d="M 500 410 Q 600 410 650 480"
          stroke="#cbd5e1"
          strokeWidth="2"
          fill="none"
        />

        {/* Action Processing - Left */}
        <rect x="50" y="480" width="180" height="70" fill="#dcfce7" stroke="#22c55e" strokeWidth="2" rx="8" />
        <text x="140" y="510" textAnchor="middle" className="text-xs font-bold fill-gray-900">
          Find Nearby Tasks
        </text>
        <text x="140" y="530" textAnchor="middle" className="text-xs fill-gray-600">
          Location-based matching
        </text>

        {/* Action Processing - Center */}
        <rect x="310" y="480" width="180" height="70" fill="#dcfce7" stroke="#22c55e" strokeWidth="2" rx="8" />
        <text x="400" y="510" textAnchor="middle" className="text-xs font-bold fill-gray-900">
          Log Work Hours
        </text>
        <text x="400" y="530" textAnchor="middle" className="text-xs fill-gray-600">
          Record volunteer time
        </text>

        {/* Action Processing - Right */}
        <rect x="570" y="480" width="180" height="70" fill="#dcfce7" stroke="#22c55e" strokeWidth="2" rx="8" />
        <text x="660" y="510" textAnchor="middle" className="text-xs font-bold fill-gray-900">
          Wellness Check-in
        </text>
        <text x="660" y="530" textAnchor="middle" className="text-xs fill-gray-600">
          Assess volunteer health
        </text>

        {/* Arrows to End */}
        <path
          d="M 140 550 Q 140 570 280 570"
          stroke="#cbd5e1"
          strokeWidth="2"
          fill="none"
        />
        <line x1="400" y1="550" x2="400" y2="570" stroke="#cbd5e1" strokeWidth="2" />
        <path
          d="M 660 550 Q 660 570 520 570"
          stroke="#cbd5e1"
          strokeWidth="2"
          fill="none"
        />

        {/* End - Call Logged */}
        <rect x="280" y="550" width="240" height="70" fill="#d1fae5" stroke="#10b981" strokeWidth="2" rx="8" />
        <circle cx="310" cy="585" r="20" fill="#10b981" />
        <text x="310" y="591" textAnchor="middle" className="text-sm font-bold fill-white">
          ✓
        </text>
        <text x="420" y="580" className="text-sm font-bold fill-gray-900">
          Call Logged & Analyzed
        </text>
        <text x="420" y="600" className="text-xs fill-gray-600">
          Data synced to dashboard
        </text>
      </svg>

      {/* Key Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-gray-900 mb-2">📱 Feature-Phone Ready</h3>
          <p className="text-sm text-gray-600">
            Works with basic phones using DTMF keypad and voice prompts
          </p>
        </div>

        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
          <h3 className="font-semibold text-gray-900 mb-2">🌍 Multilingual Support</h3>
          <p className="text-sm text-gray-600">
            Prompts in Hindi, English, and other regional languages
          </p>
        </div>

        <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
          <h3 className="font-semibold text-gray-900 mb-2">📊 Real-time Logging</h3>
          <p className="text-sm text-gray-600">
            Every call is logged and contributes to impact analytics
          </p>
        </div>
      </div>

      {/* Security Notes */}
      <div className="p-4 bg-gray-50 rounded-lg border border-slate-200">
        <div className="flex gap-3">
          <AlertCircle size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-gray-900">Security Features</h3>
            <ul className="text-sm text-gray-600 mt-2 space-y-1">
              <li>✓ Phone number hashing for privacy</li>
              <li>✓ HMAC signature validation on webhooks</li>
              <li>✓ IP whitelist for IVR provider</li>
              <li>✓ Language preferences respected</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
