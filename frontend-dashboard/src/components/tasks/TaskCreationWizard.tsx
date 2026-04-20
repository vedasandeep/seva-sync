import { useState } from 'react';
import { ChevronRight, ChevronLeft, X } from 'lucide-react';

interface TaskCreationWizardProps {
  disasters: Array<{ id: string; name: string }>;
  onClose: () => void;
  onSubmit?: (taskData: {
    title: string;
    description: string;
    disasterId: string;
    type: string;
    urgency: string;
    location: string;
    latitude: number;
    longitude: number;
    estimatedHours: number;
    requiredSkills: string[];
    maxVolunteers: number;
  }) => void;
}

const TASK_TYPES = [
  'RESCUE',
  'MEDICAL',
  'FOOD_DISTRIBUTION',
  'SHELTER',
  'LOGISTICS',
  'COMMUNICATION',
  'TRANSPORT',
  'SUPPLY_COLLECTION',
  'SAFETY',
  'OTHER',
];

const URGENCY_LEVELS = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

export default function TaskCreationWizard({
  disasters,
  onClose,
  onSubmit,
}: TaskCreationWizardProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    disasterId: '',
    type: 'LOGISTICS',
    urgency: 'MEDIUM',
    location: '',
    latitude: '',
    longitude: '',
    estimatedHours: '4',
    requiredSkills: [] as string[],
    maxVolunteers: '3',
  });

  // Load draft from localStorage
  useState(() => {
    const draft = localStorage.getItem('taskCreationDraft');
    if (draft) {
      setFormData(JSON.parse(draft));
    }
  });

  // Save draft to localStorage
  const saveDraft = () => {
    localStorage.setItem('taskCreationDraft', JSON.stringify(formData));
  };

  const handleChange = (field: string, value: string | string[]) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };
      saveDraft();
      return updated;
    });
  };

  const handleSkillToggle = (skill: string) => {
    const updated = formData.requiredSkills.includes(skill)
      ? formData.requiredSkills.filter((s) => s !== skill)
      : [...formData.requiredSkills, skill];
    handleChange('requiredSkills', updated);
  };

  const handleNext = () => {
    // Basic validation for current step
    if (step === 1 && !formData.title) {
      alert('Please enter a task title');
      return;
    }
    if (step === 2 && !formData.location) {
      alert('Please enter a location');
      return;
    }
    if (step < 4) setStep(step + 1);
  };

  const handlePrev = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = () => {
    if (!formData.title || !formData.disasterId || !formData.location) {
      alert('Please fill all required fields');
      return;
    }
    onSubmit?.({
      ...formData,
      latitude: parseFloat(formData.latitude),
      longitude: parseFloat(formData.longitude),
      estimatedHours: parseInt(formData.estimatedHours),
      maxVolunteers: parseInt(formData.maxVolunteers),
    });
    localStorage.removeItem('taskCreationDraft');
    onClose();
  };

  const handleClear = () => {
    if (confirm('Clear all form data?')) {
      setFormData({
        title: '',
        description: '',
        disasterId: '',
        type: 'LOGISTICS',
        urgency: 'MEDIUM',
        location: '',
        latitude: '',
        longitude: '',
        estimatedHours: '4',
        requiredSkills: [],
        maxVolunteers: '3',
      });
      localStorage.removeItem('taskCreationDraft');
    }
  };

  const progressPercent = (step / 4) * 100;

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={styles.header}>
          <h2 style={styles.title}>Create New Task</h2>
          <button onClick={onClose} style={styles.closeBtn} title="Close">
            <X size={20} />
          </button>
        </div>

        {/* Progress bar */}
        <div style={styles.progressContainer}>
          <div style={styles.progressBar}>
            <div style={{ ...styles.progressFill, width: `${progressPercent}%` }} />
          </div>
          <span style={styles.stepIndicator}>
            Step {step} of 4
          </span>
        </div>

        {/* Form content */}
        <div style={styles.formContent}>
          {/* Step 1: Task Details */}
          {step === 1 && (
            <div style={styles.step}>
              <h3 style={styles.stepTitle}>Task Details</h3>

              <div style={styles.formGroup}>
                <label style={styles.label}>Task Title *</label>
                <input
                  type="text"
                  placeholder="e.g., Emergency Rescue Operations"
                  value={formData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  style={styles.input}
                  maxLength={100}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Description</label>
                <textarea
                  placeholder="Detailed description of the task..."
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  style={{ ...styles.input, minHeight: '100px', resize: 'vertical' }}
                  maxLength={500}
                />
                <span style={styles.charCount}>
                  {formData.description.length}/500
                </span>
              </div>

              <div style={styles.formGrid}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Disaster *</label>
                  <select
                    value={formData.disasterId}
                    onChange={(e) => handleChange('disasterId', e.target.value)}
                    style={styles.input}
                  >
                    <option value="">Select a disaster</option>
                    {disasters.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Task Type *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => handleChange('type', e.target.value)}
                    style={styles.input}
                  >
                    {TASK_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type.replace(/_/g, ' ')}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={styles.formGrid}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Urgency *</label>
                  <select
                    value={formData.urgency}
                    onChange={(e) => handleChange('urgency', e.target.value)}
                    style={styles.input}
                  >
                    {URGENCY_LEVELS.map((level) => (
                      <option key={level} value={level}>
                        {level}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Est. Hours</label>
                  <input
                    type="number"
                    min="1"
                    max="24"
                    value={formData.estimatedHours}
                    onChange={(e) => handleChange('estimatedHours', e.target.value)}
                    style={styles.input}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Location */}
          {step === 2 && (
            <div style={styles.step}>
              <h3 style={styles.stepTitle}>Location & Scope</h3>

              <div style={styles.formGroup}>
                <label style={styles.label}>Location *</label>
                <input
                  type="text"
                  placeholder="e.g., Hyderabad Relief Camp A"
                  value={formData.location}
                  onChange={(e) => handleChange('location', e.target.value)}
                  style={styles.input}
                />
              </div>

              <div style={styles.formGrid}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Latitude *</label>
                  <input
                    type="number"
                    placeholder="17.385"
                    step="0.0001"
                    value={formData.latitude}
                    onChange={(e) => handleChange('latitude', e.target.value)}
                    style={styles.input}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Longitude *</label>
                  <input
                    type="number"
                    placeholder="78.487"
                    step="0.0001"
                    value={formData.longitude}
                    onChange={(e) => handleChange('longitude', e.target.value)}
                    style={styles.input}
                  />
                </div>
              </div>

              <div style={styles.infoBox}>
                <span style={styles.infoIcon}>ℹ️</span>
                <span style={styles.infoText}>
                  Coordinates help with volunteer location matching and task routing
                </span>
              </div>
            </div>
          )}

          {/* Step 3: Requirements */}
          {step === 3 && (
            <div style={styles.step}>
              <h3 style={styles.stepTitle}>Requirements & Skills</h3>

              <div style={styles.formGroup}>
                <label style={styles.label}>Required Skills</label>
                <div style={styles.skillsGrid}>
                  {[
                    'Search & Rescue',
                    'Medical',
                    'First Aid',
                    'Engineering',
                    'Logistics',
                    'Food Prep',
                    'Communication',
                    'Safety',
                  ].map((skill) => (
                    <label key={skill} style={styles.skillCheckbox}>
                      <input
                        type="checkbox"
                        checked={formData.requiredSkills.includes(skill)}
                        onChange={() => handleSkillToggle(skill)}
                        style={styles.checkboxInput}
                      />
                      <span>{skill}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Max Volunteers Needed *</label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={formData.maxVolunteers}
                  onChange={(e) => handleChange('maxVolunteers', e.target.value)}
                  style={styles.input}
                />
              </div>

              <div style={styles.infoBox}>
                <span style={styles.infoIcon}>👥</span>
                <span style={styles.infoText}>
                  Skills help match the right volunteers to this task
                </span>
              </div>
            </div>
          )}

          {/* Step 4: Review */}
          {step === 4 && (
            <div style={styles.step}>
              <h3 style={styles.stepTitle}>Review Task Details</h3>

              <div style={styles.reviewBox}>
                <div style={styles.reviewItem}>
                  <span style={styles.reviewLabel}>Title:</span>
                  <span style={styles.reviewValue}>{formData.title}</span>
                </div>
                <div style={styles.reviewItem}>
                  <span style={styles.reviewLabel}>Disaster:</span>
                  <span style={styles.reviewValue}>
                    {disasters.find((d) => d.id === formData.disasterId)?.name}
                  </span>
                </div>
                <div style={styles.reviewItem}>
                  <span style={styles.reviewLabel}>Type / Urgency:</span>
                  <span style={styles.reviewValue}>
                    {formData.type} / {formData.urgency}
                  </span>
                </div>
                <div style={styles.reviewItem}>
                  <span style={styles.reviewLabel}>Location:</span>
                  <span style={styles.reviewValue}>
                    {formData.location} ({formData.latitude}, {formData.longitude})
                  </span>
                </div>
                <div style={styles.reviewItem}>
                  <span style={styles.reviewLabel}>Est. Hours:</span>
                  <span style={styles.reviewValue}>{formData.estimatedHours}h</span>
                </div>
                <div style={styles.reviewItem}>
                  <span style={styles.reviewLabel}>Skills:</span>
                  <span style={styles.reviewValue}>
                    {formData.requiredSkills.length > 0
                      ? formData.requiredSkills.join(', ')
                      : 'None specified'}
                  </span>
                </div>
                <div style={styles.reviewItem}>
                  <span style={styles.reviewLabel}>Max Volunteers:</span>
                  <span style={styles.reviewValue}>{formData.maxVolunteers}</span>
                </div>
              </div>

              <div style={styles.infoBox}>
                <span style={styles.infoIcon}>✓</span>
                <span style={styles.infoText}>
                  Review the details above and click "Create Task" to submit
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer with buttons */}
        <div style={styles.footer}>
          <button
            onClick={handleClear}
            style={styles.clearBtn}
            title="Clear all form data"
          >
            🗑️ Clear
          </button>
          <div style={styles.navButtons}>
            <button
              onClick={handlePrev}
              disabled={step === 1}
              style={{
                ...styles.prevBtn,
                opacity: step === 1 ? 0.5 : 1,
                cursor: step === 1 ? 'not-allowed' : 'pointer',
              }}
            >
              <ChevronLeft size={16} /> Previous
            </button>
            {step < 4 ? (
              <button onClick={handleNext} style={styles.nextBtn}>
                Next <ChevronRight size={16} />
              </button>
            ) : (
              <button onClick={handleSubmit} style={styles.submitBtn}>
                ✓ Create Task
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0, 0, 0, 0.5)',
    zIndex: 900,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modal: {
    background: 'white',
    borderRadius: '0.75rem',
    width: '90%',
    maxWidth: '600px',
    maxHeight: '90vh',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 20px 25px rgba(0, 0, 0, 0.15)',
  },
  header: {
    padding: '1.5rem',
    borderBottom: '1px solid #e2e8f0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    margin: 0,
    fontSize: '1.25rem',
    fontWeight: 700,
    color: '#1e293b',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: 0,
    color: '#64748b',
  },
  progressContainer: {
    padding: '1rem 1.5rem',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  progressBar: {
    flex: 1,
    height: '0.5rem',
    background: '#e2e8f0',
    borderRadius: '0.25rem',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    background: '#3b82f6',
    transition: 'width 0.3s',
  },
  stepIndicator: {
    fontSize: '0.75rem',
    fontWeight: 600,
    color: '#64748b',
    whiteSpace: 'nowrap',
  },
  formContent: {
    flex: 1,
    overflowY: 'auto',
    padding: '1.5rem',
  },
  step: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  stepTitle: {
    margin: 0,
    fontSize: '1rem',
    fontWeight: 700,
    color: '#1e293b',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    position: 'relative',
  },
  label: {
    fontSize: '0.875rem',
    fontWeight: 600,
    color: '#1e293b',
  },
  input: {
    padding: '0.75rem',
    border: '1px solid #e2e8f0',
    borderRadius: '0.375rem',
    fontSize: '0.875rem',
    fontFamily: 'inherit',
  },
  charCount: {
    fontSize: '0.75rem',
    color: '#94a3b8',
    textAlign: 'right',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1rem',
  },
  skillsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '0.75rem',
  },
  skillCheckbox: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    cursor: 'pointer',
    fontSize: '0.875rem',
  },
  checkboxInput: {
    cursor: 'pointer',
  },
  infoBox: {
    background: '#f0f9ff',
    border: '1px solid #bfdbfe',
    borderRadius: '0.375rem',
    padding: '0.75rem 1rem',
    display: 'flex',
    gap: '0.75rem',
    alignItems: 'flex-start',
  },
  infoIcon: {
    fontSize: '1rem',
    marginTop: '0.125rem',
  },
  infoText: {
    fontSize: '0.8125rem',
    color: '#0369a1',
  },
  reviewBox: {
    background: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '0.375rem',
    padding: '1rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  reviewItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '1rem',
    paddingBottom: '1rem',
    borderBottom: '1px solid #e2e8f0',
  },
  reviewLabel: {
    fontWeight: 600,
    fontSize: '0.875rem',
    color: '#475569',
    minWidth: '120px',
  },
  reviewValue: {
    fontSize: '0.875rem',
    color: '#1e293b',
    textAlign: 'right',
  },
  footer: {
    padding: '1.5rem',
    borderTop: '1px solid #e2e8f0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '1rem',
  },
  clearBtn: {
    padding: '0.625rem 1rem',
    background: '#fee2e2',
    color: '#dc2626',
    border: '1px solid #fecaca',
    borderRadius: '0.375rem',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: '0.875rem',
  },
  navButtons: {
    display: 'flex',
    gap: '1rem',
  },
  prevBtn: {
    padding: '0.625rem 1rem',
    background: '#f1f5f9',
    color: '#475569',
    border: '1px solid #cbd5e1',
    borderRadius: '0.375rem',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: '0.875rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  nextBtn: {
    padding: '0.625rem 1rem',
    background: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '0.375rem',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: '0.875rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  submitBtn: {
    padding: '0.625rem 1rem',
    background: '#10b981',
    color: 'white',
    border: 'none',
    borderRadius: '0.375rem',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: '0.875rem',
  },
};
