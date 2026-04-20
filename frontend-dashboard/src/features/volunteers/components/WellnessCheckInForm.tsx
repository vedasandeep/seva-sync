import { useState } from 'react';

interface WellnessCheckInFormProps {
  volunteerId: string;
  onSubmit?: (data: WellnessCheckInData) => void;
  onCancel?: () => void;
}

export interface WellnessCheckInData {
  volunteerId: string;
  feeling: number; // 1-6 scale
  energyLevel: number; // 1-10 scale
  stressLevel: number; // 1-10 scale
  notes?: string;
  voiceNote?: File;
}

const FEELING_OPTIONS = [
  { value: 1, emoji: '😢', label: 'Very Poor' },
  { value: 2, emoji: '😞', label: 'Poor' },
  { value: 3, emoji: '😐', label: 'Neutral' },
  { value: 4, emoji: '🙂', label: 'Good' },
  { value: 5, emoji: '😊', label: 'Very Good' },
  { value: 6, emoji: '🥳', label: 'Excellent' },
];

export default function WellnessCheckInForm({
  volunteerId,
  onSubmit,
  onCancel,
}: WellnessCheckInFormProps) {
  const [feeling, setFeeling] = useState<number>(3);
  const [energyLevel, setEnergyLevel] = useState<number>(5);
  const [stressLevel, setStressLevel] = useState<number>(5);
  const [notes, setNotes] = useState('');
  const [voiceNote, setVoiceNote] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const data: WellnessCheckInData = {
        volunteerId,
        feeling,
        energyLevel,
        stressLevel,
        notes: notes || undefined,
        voiceNote: voiceNote || undefined,
      };

      onSubmit?.(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  const feelingOption = FEELING_OPTIONS.find((o) => o.value === feeling);

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <h3 style={styles.title}>Wellness Check-in</h3>

      {/* Feeling Scale */}
      <div style={styles.section}>
        <label style={styles.label}>How are you feeling?</label>
        <div style={styles.feelingScale}>
          {FEELING_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setFeeling(option.value)}
              style={{
                ...styles.feelingButton,
                backgroundColor: feeling === option.value ? '#3b82f6' : '#f1f5f9',
                transform: feeling === option.value ? 'scale(1.1)' : 'scale(1)',
              }}
              title={option.label}
            >
              {option.emoji}
            </button>
          ))}
        </div>
        <div style={styles.feelingLabel}>{feelingOption?.label}</div>
      </div>

      {/* Energy Level */}
      <div style={styles.section}>
        <label style={styles.label}>Energy Level</label>
        <input
          type="range"
          min="1"
          max="10"
          value={energyLevel}
          onChange={(e) => setEnergyLevel(parseInt(e.target.value))}
          style={styles.slider}
        />
        <div style={styles.sliderValue}>
          {energyLevel}/10
          <span style={styles.sliderLabel}>
            {energyLevel <= 3
              ? '🔋 Low'
              : energyLevel <= 6
                ? '⚡ Moderate'
                : '🔌 High'}
          </span>
        </div>
      </div>

      {/* Stress Level */}
      <div style={styles.section}>
        <label style={styles.label}>Stress Level</label>
        <input
          type="range"
          min="1"
          max="10"
          value={stressLevel}
          onChange={(e) => setStressLevel(parseInt(e.target.value))}
          style={styles.slider}
        />
        <div style={styles.sliderValue}>
          {stressLevel}/10
          <span style={styles.sliderLabel}>
            {stressLevel <= 3
              ? '😌 Low'
              : stressLevel <= 6
                ? '😓 Moderate'
                : '😰 High'}
          </span>
        </div>
      </div>

      {/* Notes */}
      <div style={styles.section}>
        <label style={styles.label}>Additional Notes (Optional)</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Share any thoughts about your wellness..."
          style={styles.textarea}
        />
      </div>

      {/* Voice Note */}
      <div style={styles.section}>
        <label style={styles.label}>Voice Note (Optional)</label>
        <div style={styles.voiceNoteArea}>
          <input
            type="file"
            accept="audio/*"
            onChange={(e) => setVoiceNote(e.target.files?.[0] || null)}
            style={styles.fileInput}
          />
          {voiceNote && (
            <div style={styles.voiceNoteInfo}>
              ✓ {voiceNote.name}
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div style={styles.actions}>
        <button
          type="button"
          onClick={onCancel}
          style={styles.cancelButton}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          style={styles.submitButton}
        >
          {isSubmitting ? 'Saving...' : 'Save Check-in'}
        </button>
      </div>
    </form>
  );
}

const styles: Record<string, React.CSSProperties> = {
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  title: {
    margin: 0,
    fontSize: '1.125rem',
    fontWeight: 600,
    color: '#1e293b',
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  label: {
    fontSize: '0.875rem',
    fontWeight: 600,
    color: '#475569',
  },
  feelingScale: {
    display: 'flex',
    gap: '0.5rem',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  feelingButton: {
    flex: '1 1 auto',
    minWidth: '50px',
    padding: '0.75rem',
    border: 'none',
    borderRadius: '0.375rem',
    cursor: 'pointer',
    fontSize: '1.75rem',
    transition: 'all 0.2s ease',
  },
  feelingLabel: {
    textAlign: 'center',
    fontSize: '0.875rem',
    color: '#64748b',
    fontWeight: 500,
  },
  slider: {
    width: '100%',
    height: '0.5rem',
    borderRadius: '0.25rem',
    backgroundColor: '#e2e8f0',
    cursor: 'pointer',
    accentColor: '#3b82f6',
  },
  sliderValue: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '0.875rem',
    color: '#1e293b',
    fontWeight: 600,
  },
  sliderLabel: {
    fontSize: '0.75rem',
    color: '#64748b',
    fontWeight: 400,
  },
  textarea: {
    padding: '0.75rem',
    border: '1px solid #cbd5e1',
    borderRadius: '0.375rem',
    fontSize: '0.875rem',
    fontFamily: 'inherit',
    minHeight: '100px',
    resize: 'vertical',
  },
  voiceNoteArea: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  fileInput: {
    padding: '0.75rem',
    border: '1px dashed #cbd5e1',
    borderRadius: '0.375rem',
    cursor: 'pointer',
  },
  voiceNoteInfo: {
    padding: '0.5rem 0.75rem',
    backgroundColor: '#dcfce7',
    border: '1px solid #86efac',
    borderRadius: '0.375rem',
    fontSize: '0.875rem',
    color: '#166534',
  },
  actions: {
    display: 'flex',
    gap: '0.75rem',
    justifyContent: 'flex-end',
  },
  cancelButton: {
    padding: '0.625rem 1.25rem',
    backgroundColor: '#f1f5f9',
    color: '#475569',
    border: '1px solid #cbd5e1',
    borderRadius: '0.375rem',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: 500,
    minHeight: '40px',
  },
  submitButton: {
    padding: '0.625rem 1.25rem',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '0.375rem',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: 500,
    minHeight: '40px',
  },
};
