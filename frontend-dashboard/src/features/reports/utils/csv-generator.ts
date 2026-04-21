/**
 * CSV Export Utilities
 * Generates CSV files from various report data
 */

/**
 * Convert array of objects to CSV string
 */
function objectsToCSV(data: Array<Record<string, any>>, headers?: string[]): string {
  if (!data || data.length === 0) {
    return '';
  }

  const keys = headers || Object.keys(data[0]);
  const csvHeaders = keys.map((h) => `"${h}"`).join(',');

  const csvRows = data
    .map((obj) =>
      keys
        .map((key) => {
          const value = obj[key];
          if (value === null || value === undefined) {
            return '';
          }
          const stringValue = String(value).replace(/"/g, '""');
          return `"${stringValue}"`;
        })
        .join(',')
    )
    .join('\n');

  return `${csvHeaders}\n${csvRows}`;
}

/**
 * Download CSV file to user's computer
 */
export function downloadCSV(csvContent: string, filename: string): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Generate IVR Call Summary CSV
 */
export function generateIvrSummaryCSV(
  data: Array<{
    callSid: string;
    volunteerName: string;
    actionType: string;
    duration: number;
    status: string;
    timestamp: string;
    language: string;
  }>
): string {
  return objectsToCSV(data, [
    'Call ID',
    'Volunteer Name',
    'Action Type',
    'Duration (seconds)',
    'Status',
    'Timestamp',
    'Language',
  ]);
}

/**
 * Generate Volunteer Performance CSV
 */
export function generateVolunteerPerformanceCSV(
  data: Array<{
    volunteerId: string;
    name: string;
    tasksCompleted: number;
    hoursLogged: number;
    avgRating: number;
    burnoutRisk: string;
    joinDate: string;
  }>
): string {
  return objectsToCSV(data, [
    'Volunteer ID',
    'Name',
    'Tasks Completed',
    'Hours Logged',
    'Average Rating',
    'Burnout Risk',
    'Join Date',
  ]);
}

/**
 * Generate Task Analytics CSV
 */
export function generateTaskAnalyticsCSV(
  data: Array<{
    taskId: string;
    title: string;
    status: string;
    assignedVolunteer: string;
    disasterName: string;
    createdDate: string;
    completedDate: string;
    urgency: string;
    hours: number;
  }>
): string {
  return objectsToCSV(data, [
    'Task ID',
    'Title',
    'Status',
    'Assigned To',
    'Disaster',
    'Created Date',
    'Completed Date',
    'Urgency',
    'Hours Estimated',
  ]);
}

/**
 * Generate Impact Metrics CSV
 */
export function generateImpactMetricsCSV(
  data: Array<{
    disasterName: string;
    startDate: string;
    endDate: string;
    peopleHelped: number;
    resourcesDistributed: number;
    volunteerHours: number;
    tasksCompleted: number;
    effectiveness: number;
  }>
): string {
  return objectsToCSV(data, [
    'Disaster Name',
    'Start Date',
    'End Date',
    'People Helped',
    'Resources Distributed',
    'Volunteer Hours',
    'Tasks Completed',
    'Effectiveness %',
  ]);
}

/**
 * Generate Disaster Report CSV
 */
export function generateDisasterReportCSV(
  data: Array<{
    disasterName: string;
    status: string;
    startDate: string;
    location: string;
    totalVolunteers: number;
    tasksAssigned: number;
    tasksCompleted: number;
    affectedPeople: number;
  }>
): string {
  return objectsToCSV(data, [
    'Disaster Name',
    'Status',
    'Start Date',
    'Location',
    'Total Volunteers',
    'Tasks Assigned',
    'Tasks Completed',
    'Affected People',
  ]);
}

/**
 * Generate Data Sync Report CSV
 */
export function generateSyncReportCSV(
  data: Array<{
    deviceId: string;
    volunteerName: string;
    lastSyncTime: string;
    syncStatus: string;
    recordsSynced: number;
    conflicts: number;
    syncDuration: number;
  }>
): string {
  return objectsToCSV(data, [
    'Device ID',
    'Volunteer Name',
    'Last Sync Time',
    'Sync Status',
    'Records Synced',
    'Conflicts',
    'Duration (seconds)',
  ]);
}

/**
 * Generate multi-sheet export data
 */
export function generateMultiSheetCSV(sheets: Record<string, string>): void {
  sheets = sheets || {};
  const timestamp = new Date().toISOString().split('T')[0];

  // Generate ZIP file with multiple CSVs
  // For now, concatenate all sheets with headers
  let allData = '';
  Object.entries(sheets).forEach(([sheetName, csv], index) => {
    if (index > 0) {
      allData += '\n\n--- ' + sheetName + ' ---\n\n';
    } else {
      allData += '--- ' + sheetName + ' ---\n\n';
    }
    allData += csv;
  });

  downloadCSV(allData, `sevasync-report-${timestamp}.csv`);
}

/**
 * Export function that handles all report types
 */
export function exportReport(
  reportType: string,
  data: any,
  _dateRange: string
): void {
  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `sevasync-${reportType}-${timestamp}.csv`;

  let csv = '';
  switch (reportType) {
    case 'ivr-summary':
      csv = generateIvrSummaryCSV(data);
      break;
    case 'volunteer-performance':
      csv = generateVolunteerPerformanceCSV(data);
      break;
    case 'task-analytics':
      csv = generateTaskAnalyticsCSV(data);
      break;
    case 'impact-metrics':
      csv = generateImpactMetricsCSV(data);
      break;
    case 'disaster-report':
      csv = generateDisasterReportCSV(data);
      break;
    case 'sync-report':
      csv = generateSyncReportCSV(data);
      break;
    default:
      console.warn(`Unknown report type: ${reportType}`);
      return;
  }

  downloadCSV(csv, filename);
}
