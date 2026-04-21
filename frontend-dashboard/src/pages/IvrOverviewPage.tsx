import { WidgetCard, DashboardSection } from '../components/dashboard';
import IVRFlowDiagram from '../features/ivr/components/IVRFlowDiagram';

/**
 * IVR Overview Page
 * Shows system architecture, flow diagram, and key features
 */

export default function IvrOverviewPage() {
  return (
    <DashboardSection>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">IVR System Overview</h1>
        <p className="text-gray-600 mt-2">
          Feature-phone inclusive volunteer coordination through voice-based IVR calls
        </p>
      </div>

      {/* Key Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <WidgetCard>
          <div className="p-6">
            <p className="text-sm text-gray-600">IVR Adoption Rate</p>
            <p className="text-3xl font-bold text-green-600 mt-2">35%</p>
            <p className="text-xs text-gray-500 mt-2">49 out of 142 volunteers</p>
          </div>
        </WidgetCard>

        <WidgetCard>
          <div className="p-6">
            <p className="text-sm text-gray-600">Calls This Week</p>
            <p className="text-3xl font-bold text-blue-600 mt-2">128</p>
            <p className="text-xs text-gray-500 mt-2">85% successful completion</p>
          </div>
        </WidgetCard>

        <WidgetCard>
          <div className="p-6">
            <p className="text-sm text-gray-600">Avg Call Duration</p>
            <p className="text-3xl font-bold text-purple-600 mt-2">2m 15s</p>
            <p className="text-xs text-gray-500 mt-2">Task assignment + acceptance</p>
          </div>
        </WidgetCard>

        <WidgetCard>
          <div className="p-6">
            <p className="text-sm text-gray-600">Languages Supported</p>
            <p className="text-3xl font-bold text-amber-600 mt-2">8</p>
            <p className="text-xs text-gray-500 mt-2">Hindi, English, Tamil, Telugu...</p>
          </div>
        </WidgetCard>
      </div>

      {/* Flow Diagram */}
      <WidgetCard className="mb-6">
        <div className="p-6">
          <IVRFlowDiagram compact={false} />
        </div>
      </WidgetCard>

      {/* Benefits Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <WidgetCard>
          <div className="p-6">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">📱</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Works Everywhere</h3>
            <p className="text-sm text-gray-600">
              Functions on basic feature phones with no internet requirement. Uses simple DTMF keypad input.
            </p>
          </div>
        </WidgetCard>

        <WidgetCard>
          <div className="p-6">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">🌍</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Multilingual Support</h3>
            <p className="text-sm text-gray-600">
              IVR prompts in regional languages ensure volunteers understand instructions in their preferred language.
            </p>
          </div>
        </WidgetCard>

        <WidgetCard>
          <div className="p-6">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">⚡</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Instant Results</h3>
            <p className="text-sm text-gray-600">
              Real-time task assignment, confirmation, and logging. Volunteers get instant feedback on their actions.
            </p>
          </div>
        </WidgetCard>
      </div>

      {/* Features List */}
      <WidgetCard className="mb-6">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-xl font-semibold text-gray-900">Supported Actions</h2>
        </div>
        <div className="divide-y divide-slate-200">
          <div className="p-6">
            <div className="flex items-start gap-4">
              <div className="text-2xl">📍</div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">Find Nearby Tasks</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Press 1 to get location-based task recommendations. System identifies nearest tasks matching volunteer's skills.
                </p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="flex items-start gap-4">
              <div className="text-2xl">⏱️</div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">Log Work Hours</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Press 2 to record hours worked. System confirms entry and syncs to volunteer profile and impact metrics.
                </p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="flex items-start gap-4">
              <div className="text-2xl">❤️</div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">Wellness Check-in</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Press 3 for wellness assessment. Checks volunteer fatigue level and identifies burnout risk early.
                </p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="flex items-start gap-4">
              <div className="text-2xl">🔐</div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">Security & Privacy</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Phone numbers hashed, HMAC signatures validated, IP whitelist enforced. All calls logged for audit trails.
                </p>
              </div>
            </div>
          </div>
        </div>
      </WidgetCard>

      {/* Integration Info */}
      <WidgetCard>
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-xl font-semibold text-gray-900">System Integration</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">IVR Provider Integration</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>✓ Twilio API for call routing</li>
                <li>✓ TwiML for call control flow</li>
                <li>✓ Webhook handlers for events</li>
                <li>✓ Dual-tone multi-frequency (DTMF)</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Database & Analytics</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>✓ Call logs in IVRLog table</li>
                <li>✓ Real-time dashboard updates</li>
                <li>✓ Historical analytics queries</li>
                <li>✓ Impact metrics aggregation</li>
              </ul>
            </div>
          </div>
        </div>
      </WidgetCard>
    </DashboardSection>
  );
}
