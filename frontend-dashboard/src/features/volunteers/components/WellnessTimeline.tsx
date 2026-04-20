interface WellnessEntry {
  date: string;
  feeling: number;
  energyLevel: number;
  stressLevel: number;
  score: number;
  note?: string;
}

interface WellnessTimelineProps {
  entries: WellnessEntry[];
}

const getFeelingEmoji = (feeling: number): string => {
  switch (feeling) {
    case 1:
      return '😢';
    case 2:
      return '😞';
    case 3:
      return '😐';
    case 4:
      return '🙂';
    case 5:
      return '😊';
    case 6:
      return '🥳';
    default:
      return '😐';
  }
};

const getScoreColor = (score: number): string => {
  if (score <= 25) return '#10b981'; // Green
  if (score <= 50) return '#f59e0b'; // Yellow
  if (score <= 75) return '#f97316'; // Orange
  return '#ef4444'; // Red
};

export default function WellnessTimeline({
  entries,
}: WellnessTimelineProps) {
  if (entries.length === 0) {
    return (
      <div style={styles.emptyState}>
        <div style={styles.emptyIcon}>📭</div>
        <p style={styles.emptyText}>No wellness check-ins yet</p>
      </div>
    );
  }

  // Sort entries by date (newest first)
  const sortedEntries = [...entries].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>Wellness Timeline</h3>
      <div style={styles.timeline}>
        {sortedEntries.map((entry, index) => {
          const date = new Date(entry.date);
          const isLast = index === sortedEntries.length - 1;
          const scoreColor = getScoreColor(entry.score);

          return (
            <div key={index} style={styles.timelineItem}>
              {/* Timeline Line */}
              {!isLast && (
                <div
                  style={{
                    ...styles.timelineLine,
                    backgroundColor: scoreColor + '30',
                  }}
                />
              )}

              {/* Content */}
              <div style={styles.itemContent}>
                {/* Dot with Feeling */}
                <div
                  style={{
                    ...styles.timelineDot,
                    backgroundColor: scoreColor,
                  }}
                >
                  <span style={styles.feelingEmoji}>
                    {getFeelingEmoji(entry.feeling)}
                  </span>
                </div>

                {/* Card */}
                <div style={styles.entryCard}>
                  <div style={styles.cardHeader}>
                    <h4 style={styles.cardTitle}>
                      {date.toLocaleDateString(undefined, {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </h4>
                    <span
                      style={{
                        ...styles.scoreTag,
                        backgroundColor: scoreColor + '20',
                        color: scoreColor,
                      }}
                    >
                      {entry.score.toFixed(1)}
                    </span>
                  </div>

                  {/* Metrics Grid */}
                  <div style={styles.metricsGrid}>
                    <div style={styles.metric}>
                      <span style={styles.metricLabel}>Feeling</span>
                      <span style={styles.metricValue}>{entry.feeling}/6</span>
                    </div>
                    <div style={styles.metric}>
                      <span style={styles.metricLabel}>Energy</span>
                      <span style={styles.metricValue}>{entry.energyLevel}/10</span>
                    </div>
                    <div style={styles.metric}>
                      <span style={styles.metricLabel}>Stress</span>
                      <span style={styles.metricValue}>{entry.stressLevel}/10</span>
                    </div>
                  </div>

                  {/* Note */}
                  {entry.note && (
                    <p style={styles.note}>{entry.note}</p>
                  )}

                  {/* Trend Indicators */}
                  <div style={styles.indicators}>
                    <span style={styles.indicator}>
                      {entry.energyLevel >= 7 ? '⚡' : entry.energyLevel >= 4 ? '🔋' : '🪫'} Energy
                    </span>
                    <span style={styles.indicator}>
                      {entry.stressLevel <= 3 ? '😌' : entry.stressLevel <= 6 ? '😓' : '😰'} Stress
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  title: {
    margin: 0,
    fontSize: '1rem',
    fontWeight: 600,
    color: '#1e293b',
  },
  timeline: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0',
  },
  timelineItem: {
    display: 'flex',
    gap: '1rem',
    position: 'relative',
  },
  timelineLine: {
    position: 'absolute',
    left: '20px',
    top: '48px',
    width: '2px',
    bottom: '-1rem',
  },
  itemContent: {
    display: 'flex',
    gap: '1rem',
    paddingBottom: '1rem',
    flex: 1,
  },
  timelineDot: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    position: 'relative',
    zIndex: 1,
  },
  feelingEmoji: {
    fontSize: '1.5rem',
  },
  entryCard: {
    flex: 1,
    padding: '1rem',
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '0.375rem',
    minWidth: 0,
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.75rem',
    gap: '1rem',
  },
  cardTitle: {
    margin: 0,
    fontSize: '0.875rem',
    fontWeight: 600,
    color: '#1e293b',
  },
  scoreTag: {
    padding: '0.25rem 0.625rem',
    borderRadius: '0.25rem',
    fontSize: '0.75rem',
    fontWeight: 700,
    whiteSpace: 'nowrap',
  },
  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '0.75rem',
    marginBottom: '0.75rem',
  },
  metric: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
    padding: '0.5rem',
    backgroundColor: 'white',
    border: '1px solid #e2e8f0',
    borderRadius: '0.25rem',
  },
  metricLabel: {
    fontSize: '0.7rem',
    fontWeight: 600,
    color: '#64748b',
  },
  metricValue: {
    fontSize: '0.875rem',
    fontWeight: 700,
    color: '#1e293b',
  },
  note: {
    margin: '0.75rem 0',
    fontSize: '0.875rem',
    color: '#475569',
    lineHeight: 1.5,
  },
  indicators: {
    display: 'flex',
    gap: '0.75rem',
    flexWrap: 'wrap',
  },
  indicator: {
    padding: '0.25rem 0.625rem',
    backgroundColor: 'white',
    border: '1px solid #e2e8f0',
    borderRadius: '9999px',
    fontSize: '0.75rem',
    color: '#64748b',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem 1rem',
    color: '#94a3b8',
  },
  emptyIcon: {
    fontSize: '2rem',
    marginBottom: '0.5rem',
  },
  emptyText: {
    margin: 0,
    fontSize: '0.875rem',
  },
};
