import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Timer } from './Timer';

describe('Timer', () => {
  it('formats 180 seconds as 3:00', () => {
    render(<Timer secondsLeft={180} />);
    expect(screen.getByText('3:00')).toBeInTheDocument();
  });

  it('formats 65 seconds as 1:05', () => {
    render(<Timer secondsLeft={65} />);
    expect(screen.getByText('1:05')).toBeInTheDocument();
  });

  it('formats 0 seconds as 0:00', () => {
    render(<Timer secondsLeft={0} />);
    expect(screen.getByText('0:00')).toBeInTheDocument();
  });

  it('is not red when there is more than 30 seconds left', () => {
    render(<Timer secondsLeft={31} />);
    expect(screen.getByText('0:31')).not.toHaveClass('text-red-600');
  });

  it('is red when 30 seconds or fewer are left', () => {
    render(<Timer secondsLeft={30} />);
    expect(screen.getByText('0:30')).toHaveClass('text-red-600');
  });
});
