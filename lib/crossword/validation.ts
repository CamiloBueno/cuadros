import type { ClueDefinition, CrosswordState } from './types';
import { clueCellKeys } from './grid';

const DIACRITIC_MARKS = /[\u0300-\u036f]/g;

export function normalizeAnswer(raw: string): string {
  return raw.trim().normalize('NFD').replace(DIACRITIC_MARKS, '').toUpperCase();
}

export function isWordComplete(state: CrosswordState, clue: ClueDefinition): boolean {
  return clueCellKeys(clue).every((key) => {
    const cell = state.cells[key];
    return !!cell && cell.typedLetter === cell.solutionLetter;
  });
}

export function isPuzzleSolved(state: CrosswordState): boolean {
  return state.clues.every((clue) => isWordComplete(state, clue));
}
