import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

// Register fonts
Font.register({
  family: 'Roboto',
  src: 'https://fonts.gstatic.com/s/roboto/v27/KFOmCnqEu92Fr1Mu4mxK.ttf',
});

const styles = StyleSheet.create({
  page: {
    backgroundColor: '#ffffff',
    padding: 40,
    fontFamily: 'Roboto',
  },
  header: {
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 10,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  table: {
    marginBottom: 20,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingVertical: 8,
  },
  tableHeader: {
    backgroundColor: '#f3f4f6',
    fontWeight: 'bold',
    color: '#374151',
  },
  tableCell: {
    flex: 1,
    fontSize: 10,
    color: '#111827',
  },
  statsGrid: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 10,
  },
  statBox: {
    flex: 1,
    padding: 12,
    backgroundColor: '#f3f4f6',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  statLabel: {
    fontSize: 9,
    color: '#6b7280',
    marginBottom: 6,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0066cc',
  },
  footer: {
    marginTop: 40,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    fontSize: 9,
    color: '#6b7280',
    textAlign: 'center',
  },
  timestamp: {
    fontSize: 9,
    color: '#9ca3af',
    marginTop: 10,
  },
});

interface ReportData {
  reportType: string;
  reportName: string;
  dateRange: string;
  summary: Record<string, any>;
  data?: Record<string, any>;
}

/**
 * Generate IVR Call Summary PDF
 */
export function generateIvrSummaryPDF(data: ReportData) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{data.reportName}</Text>
          <Text style={styles.subtitle}>SevaSync IVR Analytics Report</Text>
          <Text style={styles.subtitle}>Period: {data.dateRange}</Text>
        </View>

        {/* Summary Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Summary Metrics</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Total Calls</Text>
              <Text style={styles.statValue}>{data.summary.totalCalls || 0}</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Success Rate</Text>
              <Text style={styles.statValue}>{data.summary.successRate || 0}%</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Avg Duration</Text>
              <Text style={styles.statValue}>{data.summary.avgDuration || '0s'}</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Volunteers</Text>
              <Text style={styles.statValue}>{data.summary.volunteers || 0}</Text>
            </View>
          </View>
        </View>

        {/* Calls by Action */}
        {data.data?.callsByAction && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Calls by Action Type</Text>
            <View style={styles.table}>
              <View style={[styles.tableRow, styles.tableHeader]}>
                <Text style={styles.tableCell}>Action</Text>
                <Text style={styles.tableCell}>Count</Text>
                <Text style={styles.tableCell}>Percentage</Text>
              </View>
              {Object.entries(data.data.callsByAction).map(([action, count]) => (
                <View key={action} style={styles.tableRow}>
                  <Text style={styles.tableCell}>{action}</Text>
                  <Text style={styles.tableCell}>{String(count)}</Text>
                  <Text style={styles.tableCell}>
                    {(((count as number) / (data.summary.totalCalls as number)) * 100).toFixed(1)}%
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text>SevaSync IVR Analytics Report - Confidential</Text>
          <Text style={styles.timestamp}>
            Generated on {new Date().toLocaleString()}
          </Text>
        </View>
      </Page>
    </Document>
  );
}

/**
 * Generate Volunteer Performance PDF
 */
export function generateVolunteerPerformancePDF(data: ReportData) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>{data.reportName}</Text>
          <Text style={styles.subtitle}>Volunteer Activity & Impact Report</Text>
          <Text style={styles.subtitle}>Period: {data.dateRange}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Performance Overview</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Tasks Completed</Text>
              <Text style={styles.statValue}>{data.summary.tasksCompleted || 0}</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Hours Logged</Text>
              <Text style={styles.statValue}>{data.summary.hoursLogged || 0}</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Avg Rating</Text>
              <Text style={styles.statValue}>{data.summary.avgRating || '4.5/5'}</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Burnout Risk</Text>
              <Text style={styles.statValue}>{data.summary.burnoutRisk || 'Low'}</Text>
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <Text>SevaSync Volunteer Performance Report - Confidential</Text>
          <Text style={styles.timestamp}>
            Generated on {new Date().toLocaleString()}
          </Text>
        </View>
      </Page>
    </Document>
  );
}

/**
 * Generate Impact Metrics PDF
 */
export function generateImpactMetricsPDF(data: ReportData) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>{data.reportName}</Text>
          <Text style={styles.subtitle}>Disaster Response Impact Analysis</Text>
          <Text style={styles.subtitle}>Period: {data.dateRange}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Impact Metrics</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>People Helped</Text>
              <Text style={styles.statValue}>{data.summary.peopleHelped || 0}</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Resources Dist.</Text>
              <Text style={styles.statValue}>{data.summary.resourcesDist || 0}</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Volunteer Hours</Text>
              <Text style={styles.statValue}>{data.summary.volunteerHours || 0}</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Effectiveness</Text>
              <Text style={styles.statValue}>{data.summary.effectiveness || '95%'}</Text>
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <Text>SevaSync Impact Metrics Report - Confidential</Text>
          <Text style={styles.timestamp}>
            Generated on {new Date().toLocaleString()}
          </Text>
        </View>
      </Page>
    </Document>
  );
}

/**
 * Generic PDF generator for any report type
 */
export function generatePDF(reportType: string, data: ReportData) {
  switch (reportType) {
    case 'ivr-summary':
      return generateIvrSummaryPDF(data);
    case 'volunteer-performance':
      return generateVolunteerPerformancePDF(data);
    case 'impact-metrics':
      return generateImpactMetricsPDF(data);
    default:
      return (
        <Document>
          <Page size="A4" style={styles.page}>
            <View style={styles.header}>
              <Text style={styles.title}>{data.reportName}</Text>
              <Text style={styles.subtitle}>SevaSync Report</Text>
              <Text style={styles.subtitle}>Period: {data.dateRange}</Text>
            </View>
            <View style={styles.footer}>
              <Text>Report generated on {new Date().toLocaleString()}</Text>
            </View>
          </Page>
        </Document>
      );
  }
}
