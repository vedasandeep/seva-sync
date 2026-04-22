import React from 'react';
import { Check, X } from 'lucide-react';

interface PasswordRequirement {
  label: string;
  met: boolean;
}

interface PasswordStrengthMeterProps {
  password: string;
}

export const PasswordStrengthMeter: React.FC<PasswordStrengthMeterProps> = ({ password }) => {
  // Calculate password strength
  const requirements: PasswordRequirement[] = [
    {
      label: 'At least 8 characters',
      met: password.length >= 8,
    },
    {
      label: 'Contains uppercase letter',
      met: /[A-Z]/.test(password),
    },
    {
      label: 'Contains lowercase letter',
      met: /[a-z]/.test(password),
    },
    {
      label: 'Contains number',
      met: /\d/.test(password),
    },
    {
      label: 'Contains special character',
      met: /[!@#$%^&*]/.test(password),
    },
  ];

  const metRequirements = requirements.filter((r) => r.met).length;
  const strength = Math.round((metRequirements / requirements.length) * 100);

  // Determine strength level and color
  let strengthColor = 'bg-gray-300';
  let strengthText = 'Very Weak';
  let strengthTextColor = 'text-gray-600';

  if (strength >= 80) {
    strengthColor = 'bg-green-500';
    strengthText = 'Strong';
    strengthTextColor = 'text-green-600';
  } else if (strength >= 60) {
    strengthColor = 'bg-blue-500';
    strengthText = 'Good';
    strengthTextColor = 'text-blue-600';
  } else if (strength >= 40) {
    strengthColor = 'bg-yellow-500';
    strengthText = 'Fair';
    strengthTextColor = 'text-yellow-600';
  } else if (strength > 0) {
    strengthColor = 'bg-red-500';
    strengthText = 'Weak';
    strengthTextColor = 'text-red-600';
  }

  return (
    <div className="mt-3 mb-4">
      {/* Strength Bar */}
      <div className="flex items-center justify-between mb-2">
        <label className="text-xs font-semibold text-gray-700">Password Strength</label>
        <span className={`text-xs font-semibold ${strengthTextColor}`}>{strengthText}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all ${strengthColor}`}
          style={{ width: `${strength}%` }}
        ></div>
      </div>

      {/* Requirements Checklist */}
      <div className="mt-4 space-y-2">
        {requirements.map((req, index) => (
          <div
            key={index}
            className={`flex items-center gap-2 text-xs ${
              req.met ? 'text-green-700' : 'text-gray-500'
            }`}
          >
            {req.met ? (
              <Check size={16} className="text-green-600 flex-shrink-0" />
            ) : (
              <X size={16} className="text-gray-400 flex-shrink-0" />
            )}
            <span>{req.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PasswordStrengthMeter;
