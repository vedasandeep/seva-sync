interface BurnoutScoreIndicatorProps {
  score: number;
  trend?: 'improving' | 'stable' | 'declining';
  lastCheckinDate?: string;
}

const getBurnoutColor = (score: number): string => {
  if (score <= 25) return '#10b981'; // Green
  if (score <= 50) return '#f59e0b'; // Yellow
  if (score <= 75) return '#f97316'; // Orange
  return '#ef4444'; // Red
};

const getBurnoutLevel = (score: number): string => {
  if (score <= 25) return 'Low';
  if (score <= 50) return 'Moderate';
  if (score <= 75) return 'High';
  return 'Critical';
};

export default function BurnoutScoreIndicator({
  score,
  trend = 'stable',
  lastCheckinDate,
}: BurnoutScoreIndicatorProps) {
  const color = getBurnoutColor(score);
  const level = getBurnoutLevel(score);

  const getTrendIcon = () => {
    switch (trend) {
      case 'improving':
        return '📉';
      case 'declining':
        return '📈';
      case 'stable':
      default:
        return '➡️';
    }
  };

  const getTrendLabel = () => {
    switch (trend) {
      case 'improving':
        return 'Improving';
      case 'declining':
        return 'Declining';
      case 'stable':
      default:
        return 'Stable';
    }
  };

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>Burnout Risk</h3>

      {/* Main Score Display */}
      <div style={styles.scoreDisplay}>
        {/* Circular Gauge */}
        <svg
          width="120"
          height="120"
          viewBox="0 0 120 120"
          style={styles.gaugeIcon}
        >
          {/* Background circle */}
          <circle
            cx="60"
            cy="60"
            r="50"
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="8"
          />
          {/* Progress circle */}
          <circle
            cx="60"
            cy="60"
            r="50"
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeDasharray={`${(score / 100) * 314} 314`}
            strokeLinecap="round"
            style={{
              transform: 'rotate(-90deg)',
              transformOrigin: '60px 60px',
              transition: 'stroke-dasharray 0.3s ease',
            }}
          />
          {/* Score text */}
          <text
            x="60"
            y="60"
            textAnchor="middle"
            dy="0.3em"
            style={{
              fontSize: '32px',
              fontWeight: 700,
              fill: color,
            }}
          >
            {score.toFixed(0)}
          </text>
          <text
            x="60"
            y="75"
            textAnchor="middle"
            dy="0.3em"
            style={{
              fontSize: '12px',
              fill: '#64748b',
            }}
          >
            /100
          </text>
        </svg>

        {/* Level and Status */}
        <div style={styles.scoreInfo}>
          <div style={styles.levelLabel}>{level}</div>
          <div style={styles.trendInfo}>
            {getTrendIcon()} {getTrendLabel()}
          </div>
          {lastCheckinDate && (
            <div style={styles.checkinInfo}>
              Last check-in: {new Date(lastCheckinDate).toLocaleDateString()}
            </div>
          )}
        </div>
      </div>

      {/* Risk Breakdown (Expandable) */}
      <details style={styles.details}>
        <summary style={styles.summary}>View Detailed Factors</summary>
        <div style={styles.detailedFactors}>
          <div style={styles.factor}>
            <div style={styles.factorLabel}>Task Load</div>
            <div style={styles.factorValue}>
              <div style={{ ...styles.factorBar, width: '70%', backgroundColor: '#f59e0b' }} />
              <span style={styles.factorPercent}>70%</span>
            </div>
          </div>
          <div style={styles.factor}>
            <div style={styles.factorLabel}>Wellness Score</div>
            <div style={styles.factorValue}>
              <div style={{ ...styles.factorBar, width: '45%', backgroundColor: '#10b981' }} />
              <span style={styles.factorPercent}>45%</span>
            </div>
          </div>
          <div style={styles.factor}>
            <div style={styles.factorLabel}>Time Since Break</div>
            <div style={styles.factorValue}>
              <div style={{ ...styles.factorBar, width: '85%', backgroundColor: '#ef4444' }} />
              <span style={styles.factorPercent}>85%</span>
            </div>
          </div>
          <div style={styles.factor}>
            <div style={styles.factorLabel}>Deployment Duration</div>
            <div style={styles.factorValue}>
              <div style={{ ...styles.factorBar, width: '60%', backgroundColor: '#f97316' }} />
              <span style={styles.factorPercent}>60%</span>
            </div>
          </div>
        </div>
      </details>

      {/* Action Suggestions */}
      {score >= 50 && (
        <div style={styles.actionBox}>
          <div style={styles.actionTitle}>Recommended Actions:</div>
          <ul style={styles.actionList}>
            <li>Schedule wellness check-in within 24 hours</li>
            <li>Review workload and consider reassignments</li>
            <li>Encourage breaks and time off</li>
          </ul>
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  title: {
    margin: 0,
    fontSize: '1rem',
    fontWeight: 600,
    color: '#1e293b',
  },
  scoreDisplay: {
    display: 'flex',
    gap: '1.5rem',
    alignItems: 'center',
  },
  gaugeIcon: {
    flexShrink: 0,
  },
  scoreInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  levelLabel: {
    fontSize: '1.25rem',
    fontWeight: 700,
    color: '#1e293b',
  },
  trendInfo: {
    fontSize: '0.875rem',
    color: '#64748b',
  },
  checkinInfo: {
    fontSize: '0.75rem',
    color: '#94a3b8',
  },
  details: {
    cursor: 'pointer',
  },
  summary: {
    padding: '0.75rem',
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '0.375rem',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: 500,
    color: '#475569',
    listStyle: 'none',
    userSelect: 'none',
  },
  detailedFactors: {
    marginTop: '0.75rem',
    padding: '0.75rem',
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '0.375rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  factor: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
  },
  factorLabel: {
    fontSize: '0.75rem',
    fontWeight: 600,
    color: '#64748b',
  },
  factorValue: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  factorBar: {
    height: '0.375rem',
    borderRadius: '9999px',
    flex: 1,
  },
  factorPercent: {
    fontSize: '0.75rem',
    fontWeight: 600,
    color: '#1e293b',
    minWidth: '35px',
    textAlign: 'right',
  },
  actionBox: {
    padding: '0.75rem',
    backgroundColor: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '0.375rem',
  },
  actionTitle: {
    fontSize: '0.875rem',
    fontWeight: 600,
    color: '#991b1b',
    marginBottom: '0.5rem',
  },
  actionList: {
    margin: 0,
    paddingLeft: '1.25rem',
    fontSize: '0.875rem',
    color: '#7f1d1d',
  },
};
