import { useState } from 'react';

interface Skill {
  category: string;
  name: string;
  proficiency: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  endorsements?: number;
  verified?: boolean;
}

interface SkillMatrixProps {
  skills: Skill[];
  isMobile?: boolean;
}

const getProficiencyLevel = (
  proficiency: Skill['proficiency']
): number => {
  switch (proficiency) {
    case 'beginner':
      return 25;
    case 'intermediate':
      return 50;
    case 'advanced':
      return 75;
    case 'expert':
      return 100;
    default:
      return 0;
  }
};

const getProficiencyColor = (proficiency: Skill['proficiency']): string => {
  switch (proficiency) {
    case 'beginner':
      return '#93c5fd';
    case 'intermediate':
      return '#60a5fa';
    case 'advanced':
      return '#3b82f6';
    case 'expert':
      return '#1e40af';
    default:
      return '#cbd5e1';
  }
};

export default function SkillMatrix({
  skills,
  isMobile = false,
}: SkillMatrixProps) {
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  // Group skills by category
  const skillsByCategory = skills.reduce(
    (acc, skill) => {
      if (!acc[skill.category]) {
        acc[skill.category] = [];
      }
      acc[skill.category].push(skill);
      return acc;
    },
    {} as Record<string, Skill[]>
  );

  const categories = Object.keys(skillsByCategory).sort();

  if (skills.length === 0) {
    return (
      <div style={styles.emptyState}>
        <div style={styles.emptyIcon}>🎓</div>
        <p style={styles.emptyText}>No skills recorded</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h3 style={styles.title}>Skills & Expertise</h3>
        {!isMobile && (
          <div style={styles.viewToggle}>
            <button
              style={{
                ...styles.viewToggleBtn,
                backgroundColor: viewMode === 'list' ? '#3b82f6' : 'transparent',
                color: viewMode === 'list' ? 'white' : '#64748b',
              }}
              onClick={() => setViewMode('list')}
            >
              📋 List
            </button>
            <button
              style={{
                ...styles.viewToggleBtn,
                backgroundColor: viewMode === 'grid' ? '#3b82f6' : 'transparent',
                color: viewMode === 'grid' ? 'white' : '#64748b',
              }}
              onClick={() => setViewMode('grid')}
            >
              ⊞ Grid
            </button>
          </div>
        )}
      </div>

      {/* List View (Default) */}
      {viewMode === 'list' && (
        <div style={styles.listView}>
          {categories.map((category) => (
            <div key={category} style={styles.categorySection}>
              <h4 style={styles.categoryTitle}>{category}</h4>
              <div style={styles.skillList}>
                {skillsByCategory[category].map((skill) => (
                  <div key={skill.name} style={styles.skillItem}>
                    <div style={styles.skillHeader}>
                      <span style={styles.skillName}>{skill.name}</span>
                      {skill.verified && <span style={styles.verifiedBadge}>✓ Verified</span>}
                    </div>

                    {/* Proficiency Bar */}
                    <div style={styles.proficiencyContainer}>
                      <div style={styles.proficiencyBar}>
                        <div
                          style={{
                            ...styles.proficiencyFill,
                            width: `${getProficiencyLevel(skill.proficiency)}%`,
                            backgroundColor: getProficiencyColor(skill.proficiency),
                          }}
                        />
                      </div>
                      <span style={styles.proficiencyLabel}>{skill.proficiency}</span>
                    </div>

                    {/* Endorsements */}
                    {skill.endorsements && skill.endorsements > 0 && (
                      <div style={styles.endorsements}>
                        👍 {skill.endorsements} endorsement{skill.endorsements !== 1 ? 's' : ''}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div style={styles.gridView}>
          {skills.map((skill) => (
            <div key={skill.name} style={styles.skillCard}>
              <div style={styles.cardHeader}>
                <h4 style={styles.cardTitle}>{skill.name}</h4>
                {skill.verified && <span style={styles.cardVerified}>✓</span>}
              </div>
              <p style={styles.cardCategory}>{skill.category}</p>
              <div style={styles.cardProficiency}>
                <div
                  style={{
                    ...styles.proficiencyFill,
                    width: `${getProficiencyLevel(skill.proficiency)}%`,
                    backgroundColor: getProficiencyColor(skill.proficiency),
                    height: '4px',
                    borderRadius: '2px',
                    marginBottom: '0.25rem',
                  }}
                />
                <span style={styles.proficiencyLabel}>{skill.proficiency}</span>
              </div>
              {skill.endorsements && skill.endorsements > 0 && (
                <div style={styles.cardEndorsements}>
                  👍 {skill.endorsements}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    margin: 0,
    fontSize: '1rem',
    fontWeight: 600,
    color: '#1e293b',
  },
  viewToggle: {
    display: 'flex',
    gap: '0.25rem',
    backgroundColor: '#f1f5f9',
    padding: '0.25rem',
    borderRadius: '0.375rem',
  },
  viewToggleBtn: {
    padding: '0.375rem 0.75rem',
    border: 'none',
    borderRadius: '0.25rem',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: 500,
    transition: 'all 0.2s ease',
  },
  listView: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  categorySection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  categoryTitle: {
    margin: 0,
    fontSize: '0.875rem',
    fontWeight: 600,
    color: '#475569',
    textTransform: 'uppercase',
  },
  skillList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  skillItem: {
    padding: '0.75rem',
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '0.375rem',
  },
  skillHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.5rem',
  },
  skillName: {
    fontSize: '0.875rem',
    fontWeight: 600,
    color: '#1e293b',
  },
  verifiedBadge: {
    padding: '0.125rem 0.5rem',
    backgroundColor: '#dcfce7',
    color: '#166534',
    borderRadius: '9999px',
    fontSize: '0.7rem',
    fontWeight: 600,
  },
  proficiencyContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  proficiencyBar: {
    flex: 1,
    height: '0.375rem',
    backgroundColor: '#e2e8f0',
    borderRadius: '9999px',
    overflow: 'hidden',
  },
  proficiencyFill: {
    height: '100%',
    borderRadius: '9999px',
    transition: 'width 0.3s ease',
  },
  proficiencyLabel: {
    fontSize: '0.75rem',
    fontWeight: 600,
    color: '#64748b',
    minWidth: '80px',
    textAlign: 'right',
  },
  endorsements: {
    marginTop: '0.5rem',
    fontSize: '0.75rem',
    color: '#94a3b8',
  },
  gridView: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
    gap: '0.75rem',
  },
  skillCard: {
    padding: '0.75rem',
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '0.375rem',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '0.25rem',
  },
  cardTitle: {
    margin: 0,
    fontSize: '0.875rem',
    fontWeight: 600,
    color: '#1e293b',
  },
  cardVerified: {
    color: '#10b981',
    fontWeight: 700,
  },
  cardCategory: {
    margin: '0.25rem 0',
    fontSize: '0.7rem',
    color: '#64748b',
  },
  cardProficiency: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
    marginTop: '0.5rem',
  },
  cardEndorsements: {
    marginTop: '0.5rem',
    fontSize: '0.75rem',
    color: '#94a3b8',
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
