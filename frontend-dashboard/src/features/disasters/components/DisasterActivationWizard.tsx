import { useState } from 'react';
import { ChevronRight, ChevronLeft, Save } from 'lucide-react';

export interface DisasterActivationFormData {
  // Step 1
  type: string;
  name: string;
  severity: string;
  description: string;
  // Step 2
  location: string;
  latitude: string;
  longitude: string;
  radiusKm: string;
  estimatedAffectedPeople: string;
  // Step 3
  requiredSkills: string[];
  estimatedVolunteersNeeded: string;
  requiredResources: string;
  // Step 4 is review only
}

interface Props {
  onSubmit: (data: DisasterActivationFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const DISASTER_TYPES = [
  { value: 'FLOOD', label: 'Flood' },
  { value: 'CYCLONE', label: 'Cyclone' },
  { value: 'EARTHQUAKE', label: 'Earthquake' },
  { value: 'LANDSLIDE', label: 'Landslide' },
  { value: 'FIRE', label: 'Fire' },
  { value: 'OTHER', label: 'Other' },
];

const SEVERITY_LEVELS = [
  { value: 'LOW', label: 'Low', color: 'bg-blue-100 text-blue-800' },
  { value: 'MEDIUM', label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'HIGH', label: 'High', color: 'bg-orange-100 text-orange-800' },
  { value: 'CRITICAL', label: 'Critical', color: 'bg-red-100 text-red-800' },
];

const SKILLS_OPTIONS = [
  'Medical',
  'Search & Rescue',
  'Engineering',
  'Food Preparation',
  'Communication',
  'Transportation',
  'Logistics',
  'Water Purification',
];

export default function DisasterActivationWizard({
  onSubmit,
  onCancel,
  isLoading = false,
}: Props) {
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState<DisasterActivationFormData>({
    type: 'FLOOD',
    name: '',
    severity: 'MEDIUM',
    description: '',
    location: '',
    latitude: '',
    longitude: '',
    radiusKm: '5',
    estimatedAffectedPeople: '',
    requiredSkills: [],
    estimatedVolunteersNeeded: '',
    requiredResources: '',
  });

  const validateStep = (currentStep: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (currentStep === 1) {
      if (!form.name.trim()) newErrors.name = 'Disaster name is required';
      if (!form.type) newErrors.type = 'Type is required';
      if (!form.severity) newErrors.severity = 'Severity is required';
    } else if (currentStep === 2) {
      if (!form.location.trim()) newErrors.location = 'Location is required';
      if (form.latitude && (isNaN(parseFloat(form.latitude)) || parseFloat(form.latitude) < -90 || parseFloat(form.latitude) > 90)) {
        newErrors.latitude = 'Invalid latitude';
      }
      if (form.longitude && (isNaN(parseFloat(form.longitude)) || parseFloat(form.longitude) < -180 || parseFloat(form.longitude) > 180)) {
        newErrors.longitude = 'Invalid longitude';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  const handlePrevious = () => {
    setStep(step - 1);
  };

  const handleSubmit = async () => {
    if (validateStep(3)) {
      try {
        await onSubmit(form);
      } catch (err) {
        setErrors({ submit: err instanceof Error ? err.message : 'Failed to create disaster' });
      }
    }
  };

  const handleSkillToggle = (skill: string) => {
    setForm((prev) => ({
      ...prev,
      requiredSkills: prev.requiredSkills.includes(skill)
        ? prev.requiredSkills.filter((s) => s !== skill)
        : [...prev.requiredSkills, skill],
    }));
  };

  // Save draft to localStorage
  const saveDraft = () => {
    localStorage.setItem('disasterActivationDraft', JSON.stringify(form));
    alert('Draft saved successfully');
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg border border-slate-200 p-6 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Activate Disaster</h1>
        <p className="text-slate-600">Step {step} of 4</p>
        <div className="mt-4 flex gap-2">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`h-2 flex-1 rounded-full transition-all ${
                s <= step ? 'bg-blue-600' : 'bg-slate-200'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Error Message */}
      {errors.submit && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {errors.submit}
        </div>
      )}

      {/* Step 1: Disaster Details */}
      {step === 1 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">What happened?</h2>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Disaster Type *
            </label>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              disabled={isLoading}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-blue-500 disabled:bg-slate-50"
            >
              {DISASTER_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
            {errors.type && <p className="text-xs text-red-600 mt-1">{errors.type}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Disaster Name *
            </label>
            <input
              type="text"
              placeholder="e.g., Hyderabad Floods 2026"
              maxLength={200}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              disabled={isLoading}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-blue-500 disabled:bg-slate-50"
            />
            {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Severity Level *
            </label>
            <div className="grid grid-cols-2 gap-2">
              {SEVERITY_LEVELS.map((level) => (
                <button
                  key={level.value}
                  onClick={() => setForm({ ...form, severity: level.value })}
                  disabled={isLoading}
                  className={`p-3 rounded-lg text-sm font-medium transition-all border-2 ${
                    form.severity === level.value
                      ? `border-${level.value === 'LOW' ? 'blue' : level.value === 'MEDIUM' ? 'yellow' : level.value === 'HIGH' ? 'orange' : 'red'}-500 ${level.color}`
                      : 'border-slate-200 text-slate-700 hover:border-slate-300'
                  } disabled:opacity-50`}
                >
                  {level.label}
                </button>
              ))}
            </div>
            {errors.severity && <p className="text-xs text-red-600 mt-1">{errors.severity}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Description
            </label>
            <textarea
              placeholder="Describe the disaster situation..."
              maxLength={2000}
              rows={4}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              disabled={isLoading}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-blue-500 disabled:bg-slate-50"
            />
          </div>
        </div>
      )}

      {/* Step 2: Location & Impact */}
      {step === 2 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Where and how much?</h2>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Location *
            </label>
            <input
              type="text"
              placeholder="e.g., Hyderabad, Telangana"
              maxLength={500}
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              disabled={isLoading}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-blue-500 disabled:bg-slate-50"
            />
            {errors.location && <p className="text-xs text-red-600 mt-1">{errors.location}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Latitude
              </label>
              <input
                type="number"
                placeholder="-90 to 90"
                step="any"
                value={form.latitude}
                onChange={(e) => setForm({ ...form, latitude: e.target.value })}
                disabled={isLoading}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-blue-500 disabled:bg-slate-50"
              />
              {errors.latitude && <p className="text-xs text-red-600 mt-1">{errors.latitude}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Longitude
              </label>
              <input
                type="number"
                placeholder="-180 to 180"
                step="any"
                value={form.longitude}
                onChange={(e) => setForm({ ...form, longitude: e.target.value })}
                disabled={isLoading}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-blue-500 disabled:bg-slate-50"
              />
              {errors.longitude && <p className="text-xs text-red-600 mt-1">{errors.longitude}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Radius of Impact (km)
            </label>
            <input
              type="number"
              min="1"
              value={form.radiusKm}
              onChange={(e) => setForm({ ...form, radiusKm: e.target.value })}
              disabled={isLoading}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-blue-500 disabled:bg-slate-50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Estimated Affected People
            </label>
            <input
              type="number"
              placeholder="Estimated number of people"
              value={form.estimatedAffectedPeople}
              onChange={(e) => setForm({ ...form, estimatedAffectedPeople: e.target.value })}
              disabled={isLoading}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-blue-500 disabled:bg-slate-50"
            />
          </div>
        </div>
      )}

      {/* Step 3: Initial Requirements */}
      {step === 3 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">What do we need?</h2>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Required Skills
            </label>
            <div className="grid grid-cols-2 gap-2">
              {SKILLS_OPTIONS.map((skill) => (
                <label
                  key={skill}
                  className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-slate-50"
                >
                  <input
                    type="checkbox"
                    checked={form.requiredSkills.includes(skill)}
                    onChange={() => handleSkillToggle(skill)}
                    disabled={isLoading}
                    className="w-4 h-4 rounded border-slate-300"
                  />
                  <span className="text-sm text-slate-700">{skill}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Estimated Volunteers Needed
            </label>
            <input
              type="number"
              min="1"
              placeholder="Number of volunteers"
              value={form.estimatedVolunteersNeeded}
              onChange={(e) => setForm({ ...form, estimatedVolunteersNeeded: e.target.value })}
              disabled={isLoading}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-blue-500 disabled:bg-slate-50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Required Resources
            </label>
            <textarea
              placeholder="List resources needed (e.g., tents, medical supplies, vehicles)"
              maxLength={2000}
              rows={4}
              value={form.requiredResources}
              onChange={(e) => setForm({ ...form, requiredResources: e.target.value })}
              disabled={isLoading}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-blue-500 disabled:bg-slate-50"
            />
          </div>
        </div>
      )}

      {/* Step 4: Review */}
      {step === 4 && (
        <div className="space-y-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Ready to activate?</h2>

          <div className="bg-slate-50 rounded-lg p-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-600">Type</p>
                <p className="text-sm font-semibold text-slate-900">{form.type}</p>
              </div>
              <div>
                <p className="text-xs text-slate-600">Severity</p>
                <p className="text-sm font-semibold text-slate-900">{form.severity}</p>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-slate-600">Name</p>
                <p className="text-sm font-semibold text-slate-900">{form.name}</p>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-slate-600">Location</p>
                <p className="text-sm font-semibold text-slate-900">{form.location}</p>
              </div>
              <div>
                <p className="text-xs text-slate-600">Volunteers Needed</p>
                <p className="text-sm font-semibold text-slate-900">
                  {form.estimatedVolunteersNeeded || 'Not specified'}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-600">Skills Required</p>
                <p className="text-sm font-semibold text-slate-900">
                  {form.requiredSkills.length > 0 ? form.requiredSkills.length : 'None'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="mt-8 flex gap-3 justify-between">
        <div className="flex gap-3">
          {step > 1 && (
            <button
              onClick={handlePrevious}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>
          )}
        </div>

        <div className="flex gap-3">
          <button
            onClick={saveDraft}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            Draft
          </button>

          {step < 4 ? (
            <button
              onClick={handleNext}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Creating...' : 'Activate Disaster'}
            </button>
          )}
        </div>

        <button
          onClick={onCancel}
          disabled={isLoading}
          className="px-4 py-2 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
