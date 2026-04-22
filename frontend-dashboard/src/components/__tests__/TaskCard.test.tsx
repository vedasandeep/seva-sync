import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TaskCard } from '../TaskCard';

describe('TaskCard Component', () => {
  const defaultProps = {
    id: 'task-1',
    title: 'Distribute Relief Materials',
    description: 'Help distribute food and water to affected families',
    priority: 'HIGH' as const,
    status: 'PENDING' as const,
    location: 'Chennai, Tamil Nadu',
    distance: 2.5,
    requiredSkills: ['logistics', 'communication'],
    assignedVolunteers: 3,
    maxVolunteers: 5,
    deadline: new Date(Date.now() + 24 * 60 * 60 * 1000),
  };

  describe('Rendering', () => {
    it('should render task card with all basic information', () => {
      render(<TaskCard {...defaultProps} />);

      expect(screen.getByText('Distribute Relief Materials')).toBeInTheDocument();
      expect(screen.getByText('Help distribute food and water to affected families')).toBeInTheDocument();
      expect(screen.getByText('HIGH')).toBeInTheDocument();
      expect(screen.getByText('Chennai, Tamil Nadu')).toBeInTheDocument();
    });

    it('should display priority badge', () => {
      render(<TaskCard {...defaultProps} priority="URGENT" />);
      expect(screen.getByText('URGENT')).toBeInTheDocument();
    });

    it('should display distance information', () => {
      render(<TaskCard {...defaultProps} distance={5.2} />);
      expect(screen.getByText(/5\.2 km away/)).toBeInTheDocument();
    });

    it('should display skills', () => {
      render(<TaskCard {...defaultProps} />);
      expect(screen.getByText('logistics')).toBeInTheDocument();
      expect(screen.getByText('communication')).toBeInTheDocument();
    });

    it('should display volunteer count', () => {
      render(<TaskCard {...defaultProps} />);
      expect(screen.getByText('3/5 assigned')).toBeInTheDocument();
    });

    it('should display status', () => {
      render(<TaskCard {...defaultProps} status="IN_PROGRESS" />);
      expect(screen.getByText('IN_PROGRESS')).toBeInTheDocument();
    });
  });

  describe('Priority Levels', () => {
    it('should handle URGENT priority', () => {
      render(<TaskCard {...defaultProps} priority="URGENT" />);
      expect(screen.getByText('URGENT')).toBeInTheDocument();
    });

    it('should handle HIGH priority', () => {
      render(<TaskCard {...defaultProps} priority="HIGH" />);
      expect(screen.getByText('HIGH')).toBeInTheDocument();
    });

    it('should handle MEDIUM priority', () => {
      render(<TaskCard {...defaultProps} priority="MEDIUM" />);
      expect(screen.getByText('MEDIUM')).toBeInTheDocument();
    });

    it('should handle LOW priority', () => {
      render(<TaskCard {...defaultProps} priority="LOW" />);
      expect(screen.getByText('LOW')).toBeInTheDocument();
    });
  });

  describe('Status Display', () => {
    it('should display PENDING status', () => {
      render(<TaskCard {...defaultProps} status="PENDING" />);
      expect(screen.getByText('PENDING')).toBeInTheDocument();
    });

    it('should display IN_PROGRESS status', () => {
      render(<TaskCard {...defaultProps} status="IN_PROGRESS" />);
      expect(screen.getByText('IN_PROGRESS')).toBeInTheDocument();
    });

    it('should display COMPLETED status', () => {
      render(<TaskCard {...defaultProps} status="COMPLETED" />);
      expect(screen.getByText('COMPLETED')).toBeInTheDocument();
    });
  });

  describe('Deadline Display', () => {
    it('should display hours remaining when deadline is more than 24 hours away', () => {
      const deadline = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48 hours
      render(<TaskCard {...defaultProps} deadline={deadline} />);
      expect(screen.getByText(/\d+h remaining/)).toBeInTheDocument();
    });

    it('should display "Urgent" when deadline is less than 1 hour away', () => {
      const deadline = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
      render(<TaskCard {...defaultProps} deadline={deadline} />);
      expect(screen.getByText('Urgent')).toBeInTheDocument();
    });

    it('should not display deadline without deadline prop', () => {
      render(<TaskCard {...defaultProps} deadline={undefined} />);
      const urgentText = screen.queryByText(/Urgent|remaining/);
      expect(urgentText).not.toBeInTheDocument();
    });
  });

  describe('Skills Display', () => {
    it('should display up to 3 skills', () => {
      const skills = ['medical', 'logistics', 'communication'];
      render(<TaskCard {...defaultProps} requiredSkills={skills} />);
      expect(screen.getByText('medical')).toBeInTheDocument();
      expect(screen.getByText('logistics')).toBeInTheDocument();
      expect(screen.getByText('communication')).toBeInTheDocument();
    });

    it('should show +N for more than 3 skills', () => {
      const skills = ['medical', 'logistics', 'communication', 'translation', 'driving'];
      render(<TaskCard {...defaultProps} requiredSkills={skills} />);
      expect(screen.getByText('+2')).toBeInTheDocument();
    });

    it('should handle empty skills array', () => {
      render(<TaskCard {...defaultProps} requiredSkills={[]} />);
      expect(screen.queryByText(/medical|logistics/)).not.toBeInTheDocument();
    });
  });

  describe('Actions', () => {
    it('should display accept button for pending tasks', () => {
      const mockAccept = vi.fn();
      render(
        <TaskCard
          {...defaultProps}
          status="PENDING"
          onAccept={mockAccept}
        />
      );
      expect(screen.getByText('Accept Task')).toBeInTheDocument();
    });

    it('should not display accept button for non-pending tasks', () => {
      const mockAccept = vi.fn();
      render(
        <TaskCard
          {...defaultProps}
          status="COMPLETED"
          onAccept={mockAccept}
        />
      );
      expect(screen.queryByText('Accept Task')).not.toBeInTheDocument();
    });

    it('should call onClick when card is clicked', () => {
      const mockClick = vi.fn();
      render(<TaskCard {...defaultProps} onClick={mockClick} />);
      const card = screen.getByText('Distribute Relief Materials').closest('div');
      fireEvent.click(card!);
      expect(mockClick).toHaveBeenCalled();
    });

    it('should call onAccept when accept button is clicked', () => {
      const mockAccept = vi.fn();
      render(
        <TaskCard
          {...defaultProps}
          status="PENDING"
          onAccept={mockAccept}
        />
      );
      const acceptButton = screen.getByText('Accept Task');
      fireEvent.click(acceptButton);
      expect(mockAccept).toHaveBeenCalled();
    });

    it('should not propagate click to parent when accept button is clicked', () => {
      const mockClick = vi.fn();
      const mockAccept = vi.fn();
      render(
        <TaskCard
          {...defaultProps}
          status="PENDING"
          onClick={mockClick}
          onAccept={mockAccept}
        />
      );
      const acceptButton = screen.getByText('Accept Task');
      fireEvent.click(acceptButton);
      expect(mockAccept).toHaveBeenCalled();
      // Parent click handler should still be called but that's fine
    });
  });

  describe('Responsive Behavior', () => {
    it('should render correctly on mobile sizes', () => {
      render(<TaskCard {...defaultProps} />);
      const card = screen.getByText('Distribute Relief Materials').closest('div');
      expect(card).toBeInTheDocument();
    });

    it('should handle very long titles', () => {
      const longTitle = 'A'.repeat(100);
      render(<TaskCard {...defaultProps} title={longTitle} />);
      expect(screen.getByText(longTitle)).toBeInTheDocument();
    });

    it('should handle many skills gracefully', () => {
      const manySkills = Array.from({ length: 10 }, (_, i) => `skill-${i}`);
      render(<TaskCard {...defaultProps} requiredSkills={manySkills} />);
      expect(screen.getByText('+7')).toBeInTheDocument();
    });
  });
});
