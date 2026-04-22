import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { OfflineIndicator } from '../OfflineIndicator';

describe('OfflineIndicator Component', () => {
  beforeEach(() => {
    // Mock navigator.onLine
    Object.defineProperty(window.navigator, 'onLine', {
      writable: true,
      value: true,
    });
  });

  describe('Online Status', () => {
    it('should not render when online', () => {
      Object.defineProperty(window.navigator, 'onLine', {
        writable: true,
        value: true,
      });

      const { container } = render(<OfflineIndicator />);
      expect(container.firstChild).toBeNull();
    });

    it('should render when offline', async () => {
      Object.defineProperty(window.navigator, 'onLine', {
        writable: true,
        value: false,
      });

      render(<OfflineIndicator />);

      await waitFor(() => {
        expect(
          screen.getByText('You are offline. Changes will be saved locally.')
        ).toBeInTheDocument();
      });
    });
  });

  describe('Custom Messages', () => {
    it('should display default message when offline', async () => {
      Object.defineProperty(window.navigator, 'onLine', {
        writable: true,
        value: false,
      });

      render(<OfflineIndicator />);

      await waitFor(() => {
        expect(
          screen.getByText('You are offline. Changes will be saved locally.')
        ).toBeInTheDocument();
      });
    });

    it('should display custom message when provided', async () => {
      Object.defineProperty(window.navigator, 'onLine', {
        writable: true,
        value: false,
      });

      render(
        <OfflineIndicator message="Network connection lost" />
      );

      await waitFor(() => {
        expect(screen.getByText('Network connection lost')).toBeInTheDocument();
      });
    });
  });

  describe('Positioning', () => {
    it('should position at bottom by default', async () => {
      Object.defineProperty(window.navigator, 'onLine', {
        writable: true,
        value: false,
      });

      const { container } = render(<OfflineIndicator />);

      await waitFor(() => {
        const indicator = container.firstChild as HTMLElement;
        expect(indicator).toHaveStyle({ bottom: '1rem' });
      });
    });

    it('should position at top when requested', async () => {
      Object.defineProperty(window.navigator, 'onLine', {
        writable: true,
        value: false,
      });

      const { container } = render(<OfflineIndicator position="top" />);

      await waitFor(() => {
        const indicator = container.firstChild as HTMLElement;
        expect(indicator).toHaveStyle({ top: '1rem' });
      });
    });
  });

  describe('Event Listeners', () => {
    it('should listen for online event', async () => {
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener');

      render(<OfflineIndicator />);

      expect(addEventListenerSpy).toHaveBeenCalledWith(
        'online',
        expect.any(Function)
      );
      expect(addEventListenerSpy).toHaveBeenCalledWith(
        'offline',
        expect.any(Function)
      );

      addEventListenerSpy.mockRestore();
    });

    it('should remove event listeners on unmount', async () => {
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');

      const { unmount } = render(<OfflineIndicator />);
      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'online',
        expect.any(Function)
      );
      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'offline',
        expect.any(Function)
      );

      removeEventListenerSpy.mockRestore();
    });
  });
});
