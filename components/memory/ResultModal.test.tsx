import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ResultModal } from './ResultModal';

describe('ResultModal', () => {
  it('shows the win message when status is won', () => {
    render(<ResultModal status="won" open onRetry={vi.fn()} onClose={vi.fn()} />);
    expect(screen.getByText('¡Encontraste todas las parejas!')).toBeInTheDocument();
  });

  it('shows the lose message when status is lost', () => {
    render(<ResultModal status="lost" open onRetry={vi.fn()} onClose={vi.fn()} />);
    expect(screen.getByText('Se acabó el tiempo')).toBeInTheDocument();
  });

  it('renders nothing when closed', () => {
    render(<ResultModal status="won" open={false} onRetry={vi.fn()} onClose={vi.fn()} />);
    expect(screen.queryByText('¡Encontraste todas las parejas!')).not.toBeInTheDocument();
  });

  it('calls onRetry when the retry button is clicked', async () => {
    const onRetry = vi.fn();
    render(<ResultModal status="lost" open onRetry={onRetry} onClose={vi.fn()} />);
    await userEvent.click(screen.getByRole('button', { name: 'Reintentar' }));
    expect(onRetry).toHaveBeenCalled();
  });
});
