import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ErrorBoundary } from '../ErrorBoundary';

// Component that throws an error
const ThrowError = () => {
  throw new Error('Test error message');
};

const HealthyComponent = () => <div>Healthy component</div>;

describe('ErrorBoundary Component', () => {
  describe('Rendering', () => {
    it('should render children when no error occurs', () => {
      render(
        <ErrorBoundary>
          <HealthyComponent />
        </ErrorBoundary>
      );

      expect(screen.getByText('Healthy component')).toBeInTheDocument();
    });

    it('should display error UI when child component throws', () => {
      // Suppress console.error for this test
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
      expect(screen.getByText(/test error message/i)).toBeInTheDocument();

      consoleSpy.mockRestore();
    });

    it('should display custom fallback when provided', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      render(
        <ErrorBoundary fallback={<div>Custom error UI</div>}>
          <ThrowError />
        </ErrorBoundary>
      );

      expect(screen.getByText('Custom error UI')).toBeInTheDocument();
      expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument();

      consoleSpy.mockRestore();
    });
  });

  describe('Error Handling', () => {
    it('should log error information', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it('should handle multiple consecutive errors', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const { rerender } = render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();

      // Second error should also be caught
      rerender(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();

      consoleSpy.mockRestore();
    });
  });

  describe('Try Again Button', () => {
    it('should display try again button', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      const tryAgainButton = screen.getByText('Try Again');
      expect(tryAgainButton).toBeInTheDocument();

      consoleSpy.mockRestore();
    });
  });

  describe('Error Messages', () => {
    it('should display error message from thrown error', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      expect(screen.getByText(/test error message/i)).toBeInTheDocument();

      consoleSpy.mockRestore();
    });

    it('should display default message when error message is unavailable', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const ThrowGenericError = () => {
        throw new Error();
      };

      render(
        <ErrorBoundary>
          <ThrowGenericError />
        </ErrorBoundary>
      );

      // Will show "Something went wrong"
      expect(
        screen.getByText('Something went wrong')
      ).toBeInTheDocument();

      consoleSpy.mockRestore();
    });
  });
});
