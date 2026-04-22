import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import LoadingSpinner from '../LoadingSpinner';

describe('LoadingSpinner Component', () => {
  describe('Rendering', () => {
    it('should render loading spinner', () => {
      const { container } = render(<LoadingSpinner />);
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('should render with default medium size', () => {
      const { container } = render(<LoadingSpinner />);
      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('width', '48');
      expect(svg).toHaveAttribute('height', '48');
    });

    it('should render with small size', () => {
      const { container } = render(<LoadingSpinner size="small" />);
      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('width', '32');
      expect(svg).toHaveAttribute('height', '32');
    });

    it('should render with large size', () => {
      const { container } = render(<LoadingSpinner size="large" />);
      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('width', '64');
      expect(svg).toHaveAttribute('height', '64');
    });
  });

  describe('Messages', () => {
    it('should display loading message when provided', () => {
      render(<LoadingSpinner message="Loading data..." />);
      expect(screen.getByText('Loading data...')).toBeInTheDocument();
    });

    it('should not display message when not provided', () => {
      render(<LoadingSpinner />);
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });
  });

  describe('Full Screen Mode', () => {
    it('should render as inline by default', () => {
      const { container } = render(<LoadingSpinner />);
      const spinner = container.firstChild;
      expect(spinner).toHaveStyle({ display: 'flex' });
    });

    it('should render as full screen when requested', () => {
      const { container } = render(<LoadingSpinner fullScreen />);
      const spinner = container.firstChild;
      expect(spinner).toHaveStyle({
        position: 'fixed',
        top: '0',
        left: '0',
        right: '0',
        bottom: '0',
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper semantic structure', () => {
      const { container } = render(<LoadingSpinner message="Loading..." />);
      const spinner = container.firstChild;
      expect(spinner).toBeInTheDocument();
    });
  });
});
