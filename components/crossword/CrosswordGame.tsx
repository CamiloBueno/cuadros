'use client';

import { useEffect, useReducer, useRef } from 'react';
import { CrosswordGrid } from './CrosswordGrid';
import { ClueList } from './ClueList';
import { ProgressReadout } from './ProgressReadout';
import { createInitialState, crosswordReducer } from '@/lib/crossword/reducer';
import { isWordComplete } from '@/lib/crossword/validation';
import type { ClueDefinition } from '@/lib/crossword/types';

interface CrosswordGameProps {
  clues: ClueDefinition[];
}

const ARROW_DELTAS: Record<string, { deltaRow: number; deltaCol: number }> = {
  ArrowUp: { deltaRow: -1, deltaCol: 0 },
  ArrowDown: { deltaRow: 1, deltaCol: 0 },
  ArrowLeft: { deltaRow: 0, deltaCol: -1 },
  ArrowRight: { deltaRow: 0, deltaCol: 1 },
};

export function CrosswordGame({ clues }: CrosswordGameProps) {
  const [state, dispatch] = useReducer(crosswordReducer, clues, createInitialState);
  const cellRefs = useRef(new Map<string, HTMLInputElement>());

  // Focus is a DOM side effect and must only run post-mount, in an effect keyed
  // on the active cell — never during render, same hydration discipline the repo
  // applies to memorama's Math.random() shuffle (see CLAUDE.md).
  useEffect(() => {
    if (state.activeCellKey) {
      cellRefs.current.get(state.activeCellKey)?.focus();
    }
  }, [state.activeCellKey]);

  function registerCellRef(key: string, el: HTMLInputElement | null) {
    if (el) cellRefs.current.set(key, el);
    else cellRefs.current.delete(key);
  }

  function handleActivate(row: number, col: number) {
    dispatch({ type: 'ACTIVATE_CELL', row, col });
  }

  function handleSelectClue(clueId: string) {
    dispatch({ type: 'ACTIVATE_CLUE', clueId });
  }

  function handleChangeLetter(letter: string) {
    if (!letter) {
      dispatch({ type: 'BACKSPACE' });
      return;
    }
    dispatch({ type: 'TYPE_LETTER', letter });
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace') {
      e.preventDefault();
      dispatch({ type: 'BACKSPACE' });
      return;
    }
    const delta = ARROW_DELTAS[e.key];
    if (delta) {
      e.preventDefault();
      dispatch({ type: 'MOVE', ...delta });
    }
  }

  const solvedClueIds = new Set(state.clues.filter((clue) => isWordComplete(state, clue)).map((clue) => clue.id));
  const activeClueId = state.activeCellKey
    ? state.cells[state.activeCellKey]?.memberOf[state.activeDirection] ?? null
    : null;

  return (
    <div className="flex flex-col md:flex-row gap-8">
      <div className="flex flex-col gap-4">
        <CrosswordGrid
          rows={state.rows}
          cols={state.cols}
          cells={state.cells}
          activeCellKey={state.activeCellKey}
          status={state.status}
          onActivate={handleActivate}
          onChangeLetter={handleChangeLetter}
          onKeyDown={handleKeyDown}
          registerCellRef={registerCellRef}
        />
        <ProgressReadout solvedCount={solvedClueIds.size} totalCount={state.clues.length} />
        {state.status === 'won' && <p className="font-semibold text-green-700">¡Completaste el crucigrama!</p>}
      </div>
      <ClueList clues={state.clues} activeClueId={activeClueId} solvedClueIds={solvedClueIds} onSelect={handleSelectClue} />
    </div>
  );
}
