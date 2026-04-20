interface WellnessEntry {
  date: string;
  feeling: number;
  energyLevel: number;
  stressLevel: number;
  score: number;
  note?: string;
}

interface WellnessHistoryChartProps {
  data: WellnessEntry[];
}

export default function WellnessHistoryChart({
  data,
}: WellnessHistoryChartProps) {
  if (data.length === 0) {
    return (
      <div style={styles.emptyState}>
        <div style={styles.emptyIcon}>📉</div>
        <p style={styles.emptyText}>No wellness history available</p>
      </div>
    );
  }

  // Calculate statistics
  const avgScore = (data.reduce((sum, d) => sum + d.score, 0) / data.length).toFixed(1);
  const avgEnergy = Math.round(
    data.reduce((sum, d) => sum + d.energyLevel, 0) / data.length
  );
  const avgStress = Math.round(
    data.reduce((sum, d) => sum + d.stressLevel, 0) / data.length
  );

  // Normalize data for visualization (0-100 scale)
  const maxScore = Math.max(...data.map((d) => d.score), 100);
  const chartHeight = 200;
  const barWidth = Math.max(20, 100 / data.length);

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>Wellness Trends</h3>

      {/* Statistics */}
      <div style={styles.stats}>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>Average Score</div>
          <div style={styles.statValue}>{avgScore}/10</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>Avg Energy</div>
          <div style={styles.statValue}>{avgEnergy}/10</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>Avg Stress</div>
          <div style={styles.statValue}>{avgStress}/10</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>Entries</div>
          <div style={styles.statValue}>{data.length}</div>
        </div>
      </div>

      {/* Chart */}
      <div style={styles.chartContainer}>
        <svg
          width="100%"
          height={chartHeight}
          viewBox={`0 0 ${Math.max(data.length * barWidth + 40, 400)} ${chartHeight}`}
          preserveAspectRatio="xMidYMid meet"
          style={styles.chart}
        >
          {/* Y-axis labels */}
          <text x="20" y="20" style={styles.axisLabel}>
            10
          </text>
          <text x="20" y={chartHeight / 2} style={styles.axisLabel}>
            5
          </text>
          <text x="20" y={chartHeight - 10} style={styles.axisLabel}>
            0
          </text>

          {/* Grid lines */}
          <line
            x1="40"
            y1="20"
            x2={Math.max(data.length * barWidth + 20, 400)}
            y2="20"
            stroke="#e2e8f0"
            strokeWidth="1"
          />
          <line
            x1="40"
            y1={chartHeight / 2}
            x2={Math.max(data.length * barWidth + 20, 400)}
            y2={chartHeight / 2}
            stroke="#e2e8f0"
            strokeWidth="1"
          />
          <line
            x1="40"
            y1={chartHeight - 10}
            x2={Math.max(data.length * barWidth + 20, 400)}
            y2={chartHeight - 10}
            stroke="#e2e8f0"
            strokeWidth="1"
          />

          {/* Bars */}
          {data.map((entry, index) => {
            const barHeight = (entry.score / maxScore) * (chartHeight - 40);
            const barX = 40 + index * (barWidth + 2);
            const barY = chartHeight - 10 - barHeight;

            return (
              <g key={index}>
                {/* Bar */}
                <rect
                  x={barX}
                  y={barY}
                  width={barWidth}
                  height={barHeight}
                  fill={
                    entry.score <= 25
                      ? '#10b981'
                      : entry.score <= 50
                        ? '#f59e0b'
                        : entry.score <= 75
                          ? '#f97316'
                          : '#ef4444'
                  }
                  opacity="0.8"
                  style={styles.bar}
                />
              </g>
            );
          })}
        </svg>
      </div>

      {/* Data Table */}
      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead style={styles.thead}>
            <tr>
              <th style={styles.th}>Date</th>
              <th style={styles.th}>Feeling</th>
              <th style={styles.th}>Energy</th>
              <th style={styles.th}>Stress</th>
              <th style={styles.th}>Score</th>
            </tr>
          </thead>
          <tbody style={styles.tbody}>
            {data.slice(-10).map((entry, index) => (
              <tr key={index}>
                <td style={styles.td}>
                  {new Date(entry.date).toLocaleDateString()}
                </td>
                <td style={styles.td}>{entry.feeling}/6</td>
                <td style={styles.td}>{entry.energyLevel}/10</td>
                <td style={styles.td}>{entry.stressLevel}/10</td>
                <td
                  style={{
                    ...styles.td,
                    fontWeight: 600,
                    color:
                      entry.score <= 25
                        ? '#10b981'
                        : entry.score <= 50
                          ? '#f59e0b'
                          : entry.score <= 75
                            ? '#f97316'
                            : '#ef4444',
                  }}
                >
                  {entry.score.toFixed(1)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
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
  stats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
    gap: '1rem',
  },
  statCard: {
    padding: '0.75rem',
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '0.375rem',
  },
  statLabel: {
    fontSize: '0.75rem',
    fontWeight: 600,
    color: '#64748b',
    marginBottom: '0.25rem',
  },
  statValue: {
    fontSize: '1.25rem',
    fontWeight: 700,
    color: '#1e293b',
  },
  chartContainer: {
    width: '100%',
    overflow: 'auto',
    backgroundColor: 'white',
    border: '1px solid #e2e8f0',
    borderRadius: '0.375rem',
    padding: '1rem',
  },
  chart: {
    minWidth: '100%',
  },
  axisLabel: {
    fontSize: '12px',
    fill: '#64748b',
    textAnchor: 'end',
  },
  bar: {
    cursor: 'pointer',
    transition: 'opacity 0.2s ease',
  },
  tableContainer: {
    overflow: 'auto',
    border: '1px solid #e2e8f0',
    borderRadius: '0.375rem',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '0.875rem',
  },
  thead: {
    backgroundColor: '#f8fafc',
    borderBottom: '2px solid #e2e8f0',
  },
  th: {
    padding: '0.75rem',
    textAlign: 'left',
    fontWeight: 600,
    color: '#475569',
  },
  tbody: {
    textAlign: 'left',
  },
  td: {
    padding: '0.75rem',
    borderBottom: '1px solid #e2e8f0',
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
