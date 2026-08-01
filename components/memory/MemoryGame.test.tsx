import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { MemoryGame } from './MemoryGame';
import type { MemoryPair } from '@/lib/game/types';

const pairs: MemoryPair[] = [
  { id: 'p1', imageUrl: 'img1.png', labelText: 'Biblioteca' },
  { id: 'p2', imageUrl: 'img2.png', labelText: 'Gimnasio' },
];

function getCardButton(cardId: string) {
  return screen.getByLabelText((_, el) => el.tagName === 'BUTTON' && el.dataset.cardId === cardId);
}

// NOTE on interaction helper: the plan's original test code used
// `userEvent.setup({ delay: null })` + `await user.click(...)`. Under this
// project's toolchain (React 19.1 + @testing-library/react 16.3 +
// @testing-library/user-event 14.6 + Vitest 4 fake timers), a bare
// `await user.click(...)` deadlocks permanently: userEvent's internal click
// resolution awaits a timer-driven microtask that never fires unless the fake
// clock is either auto-advanced (`shouldAdvanceTime: true`, which then races
// unpredictably with explicit `vi.advanceTimersByTimeAsync` calls and made the
// 800ms mismatch-delay assertion flaky/wrong by ~100ms in repeated trials) or
// pumped concurrently while awaiting (impossible with a single top-level
// `await`). This was verified with isolated repro cases (bare click hangs
// with no timers involved at all; `fireEvent.click` resolves synchronously
// and deterministically). `fireEvent.click` exercises the exact same
// `onClick` handler on the same DOM button and is the standard RTL escape
// hatch for this documented userEvent + fake-timers incompatibility, so it is
// used here instead, with `vi.advanceTimersByTimeAsync` wrapped in `act(...)`
// per React 19's stricter act-environment requirements for batched async
// state updates outside of RTL's own event helpers.
describe('MemoryGame', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('matches two cards from the same pair and shows the win modal once all pairs are found', async () => {
    render(<MemoryGame pairs={pairs} />);

    fireEvent.click(getCardButton('p1-image'));
    fireEvent.click(getCardButton('p1-text'));
    fireEvent.click(getCardButton('p2-image'));
    fireEvent.click(getCardButton('p2-text'));

    expect(screen.getByText('¡Encontraste todas las parejas!')).toBeInTheDocument();
  });

  it('flips mismatched cards back down after the delay', async () => {
    render(<MemoryGame pairs={pairs} />);

    // Two text-type cards from different pairs, so both label texts are
    // rendered as visible text (an image-type card renders an <img>, not
    // its pair's label text, so it can never satisfy a getByText('Biblioteca')
    // assertion).
    fireEvent.click(getCardButton('p1-text'));
    fireEvent.click(getCardButton('p2-text'));

    expect(screen.getByText('Biblioteca')).toBeInTheDocument();
    expect(screen.getByText('Gimnasio')).toBeInTheDocument();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(800);
    });

    expect(screen.queryByText('Biblioteca')).not.toBeInTheDocument();
    expect(screen.queryByText('Gimnasio')).not.toBeInTheDocument();
  });

  it('shows the lose modal when the timer runs out', async () => {
    render(<MemoryGame pairs={pairs} />);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(180_000);
    });

    expect(screen.getByText('Se acabó el tiempo')).toBeInTheDocument();
  });

  it('resets the board when retry is clicked after a loss', async () => {
    render(<MemoryGame pairs={pairs} />);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(180_000);
    });
    expect(screen.getByText('Se acabó el tiempo')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Reintentar' }));

    expect(screen.queryByText('Se acabó el tiempo')).not.toBeInTheDocument();
    expect(screen.getByText('3:00')).toBeInTheDocument();
  });
});
