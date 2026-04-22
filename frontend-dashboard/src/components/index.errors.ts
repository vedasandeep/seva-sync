/**
 * Error and UI Component Exports
 * Phase 4: Error UI Components and Loading States
 */

// Error Boundaries
export { ErrorBoundary } from './ErrorBoundary';
export { NetworkErrorBoundary } from './NetworkErrorBoundary';

// Indicators & Alerts
export { OfflineIndicator } from './OfflineIndicator';
export { Alert, type AlertType } from './Alert';
export { LoadingSpinner } from './LoadingSpinner';

// Export from pages
export { Error404Page } from '../pages/Error404Page';
export { Error500Page } from '../pages/Error500Page';
export { Error403Page } from '../pages/Error403Page';

export default {
  ErrorBoundary: require('./ErrorBoundary').default,
  NetworkErrorBoundary: require('./NetworkErrorBoundary').default,
  OfflineIndicator: require('./OfflineIndicator').default,
  Alert: require('./Alert').default,
  LoadingSpinner: require('./LoadingSpinner').default,
};
