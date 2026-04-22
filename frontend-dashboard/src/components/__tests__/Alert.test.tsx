import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Alert from '../Alert';

describe('Alert Component', () => {
  describe('Rendering', () => {
    it('should render error alert', () => {
      render(
        <Alert
          type="error"
          title="Error"
          message="An error occurred"
        />
      );

      expect(screen.getByText('Error')).toBeInTheDocument();
      expect(screen.getByText('An error occurred')).toBeInTheDocument();
    });

    it('should render warning alert', () => {
      render(
        <Alert
          type="warning"
          title="Warning"
          message="Something might be wrong"
        />
      );

      expect(screen.getByText('Warning')).toBeInTheDocument();
      expect(screen.getByText('Something might be wrong')).toBeInTheDocument();
    });

    it('should render success alert', () => {
      render(
        <Alert
          type="success"
          title="Success"
          message="Operation completed"
        />
      );

      expect(screen.getByText('Success')).toBeInTheDocument();
      expect(screen.getByText('Operation completed')).toBeInTheDocument();
    });

    it('should render info alert', () => {
      render(
        <Alert
          type="info"
          title="Information"
          message="Here is some information"
        />
      );

      expect(screen.getByText('Information')).toBeInTheDocument();
      expect(screen.getByText('Here is some information')).toBeInTheDocument();
    });
  });

  describe('Dismissal', () => {
    it('should show dismiss button when onDismiss is provided', () => {
      const mockDismiss = vi.fn();
      render(
        <Alert
          type="error"
          title="Error"
          message="Test error"
          onDismiss={mockDismiss}
        />
      );

      const dismissButton = screen.getByLabelText('Dismiss alert');
      expect(dismissButton).toBeInTheDocument();
    });

    it('should call onDismiss when dismiss button is clicked', () => {
      const mockDismiss = vi.fn();
      render(
        <Alert
          type="error"
          title="Error"
          message="Test error"
          onDismiss={mockDismiss}
        />
      );

      const dismissButton = screen.getByLabelText('Dismiss alert');
      fireEvent.click(dismissButton);

      expect(mockDismiss).toHaveBeenCalledOnce();
    });

    it('should not show dismiss button when onDismiss is not provided', () => {
      render(
        <Alert
          type="error"
          title="Error"
          message="Test error"
        />
      );

      const dismissButton = screen.queryByLabelText('Dismiss alert');
      expect(dismissButton).not.toBeInTheDocument();
    });
  });

  describe('Actions', () => {
    it('should show action button when action is provided', () => {
      const mockAction = vi.fn();
      render(
        <Alert
          type="error"
          title="Error"
          message="Test error"
          action={{
            label: 'Retry',
            onClick: mockAction,
          }}
        />
      );

      expect(screen.getByText('Retry')).toBeInTheDocument();
    });

    it('should call action onClick when button is clicked', () => {
      const mockAction = vi.fn();
      render(
        <Alert
          type="error"
          title="Error"
          message="Test error"
          action={{
            label: 'Retry',
            onClick: mockAction,
          }}
        />
      );

      const actionButton = screen.getByText('Retry');
      fireEvent.click(actionButton);

      expect(mockAction).toHaveBeenCalledOnce();
    });

    it('should not show action button when action is not provided', () => {
      render(
        <Alert
          type="error"
          title="Error"
          message="Test error"
        />
      );

      const retryButton = screen.queryByText('Retry');
      expect(retryButton).not.toBeInTheDocument();
    });
  });

  describe('Combined Features', () => {
    it('should handle both dismiss and action', () => {
      const mockDismiss = vi.fn();
      const mockAction = vi.fn();

      render(
        <Alert
          type="warning"
          title="Warning"
          message="Are you sure?"
          onDismiss={mockDismiss}
          action={{
            label: 'Confirm',
            onClick: mockAction,
          }}
        />
      );

      expect(screen.getByLabelText('Dismiss alert')).toBeInTheDocument();
      expect(screen.getByText('Confirm')).toBeInTheDocument();
    });
  });
});
