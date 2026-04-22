import React from 'react';

interface LoadingSkeletonProps {
  rows?: number;
  type?: 'table' | 'card' | 'list' | 'profile';
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ rows = 5, type = 'list' }) => {
  const keyframes = `
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
  `;

  const skeletonStyle: React.CSSProperties = {
    animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
    background: '#e2e8f0',
    borderRadius: '0.5rem',
  };

  if (type === 'table') {
    return (
      <div style={styles.container}>
        <style>{keyframes}</style>
        <table style={styles.table}>
          <thead>
            <tr style={styles.headerRow}>
              {[...Array(5)].map((_, i) => (
                <th key={i} style={styles.th}>
                  <div style={{ ...skeletonStyle, height: '20px' }}></div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...Array(rows)].map((_, rowIdx) => (
              <tr key={rowIdx} style={styles.row}>
                {[...Array(5)].map((_, colIdx) => (
                  <td key={colIdx} style={styles.td}>
                    <div style={{ ...skeletonStyle, height: '20px' }}></div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (type === 'card') {
    return (
      <div style={styles.container}>
        <style>{keyframes}</style>
        <div style={styles.cardGrid}>
          {[...Array(rows)].map((_, i) => (
            <div key={i} style={styles.card}>
              <div style={{ ...skeletonStyle, height: '100px', marginBottom: '1rem' }}></div>
              <div style={{ ...skeletonStyle, height: '20px', marginBottom: '0.5rem' }}></div>
              <div style={{ ...skeletonStyle, height: '20px', width: '80%' }}></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (type === 'profile') {
    return (
      <div style={styles.container}>
        <style>{keyframes}</style>
        <div style={styles.profileContainer}>
          <div style={{ ...skeletonStyle, width: '100px', height: '100px', borderRadius: '50%', marginBottom: '1rem' }}></div>
          <div style={{ ...skeletonStyle, height: '28px', width: '200px', marginBottom: '1rem' }}></div>
          <div style={styles.profileFields}>
            {[...Array(4)].map((_, i) => (
              <div key={i} style={styles.profileField}>
                <div style={{ ...skeletonStyle, height: '16px', width: '100px', marginBottom: '0.5rem' }}></div>
                <div style={{ ...skeletonStyle, height: '40px' }}></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Default list skeleton
  return (
    <div style={styles.container}>
      <style>{keyframes}</style>
      {[...Array(rows)].map((_, i) => (
        <div key={i} style={styles.listItem}>
          <div style={{ ...skeletonStyle, height: '20px', marginBottom: '0.75rem' }}></div>
          <div style={{ ...skeletonStyle, height: '16px', width: '80%' }}></div>
        </div>
      ))}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    width: '100%',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  headerRow: {
    borderBottom: '1px solid #e2e8f0',
  },
  th: {
    padding: '1rem',
    textAlign: 'left',
  },
  row: {
    borderBottom: '1px solid #f1f5f9',
  },
  td: {
    padding: '1rem',
  },
  cardGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
    gap: '1.5rem',
  },
  card: {
    padding: '1.5rem',
    background: '#f8fafc',
    borderRadius: '0.75rem',
  },
  listItem: {
    padding: '1rem',
    marginBottom: '1rem',
    background: '#f8fafc',
    borderRadius: '0.5rem',
  },
  profileContainer: {
    padding: '2rem',
    textAlign: 'center',
    background: '#f8fafc',
    borderRadius: '0.75rem',
  },
  profileFields: {
    display: 'grid',
    gap: '1.5rem',
    marginTop: '2rem',
  },
  profileField: {
    textAlign: 'left',
  },
};

export default LoadingSkeleton;
