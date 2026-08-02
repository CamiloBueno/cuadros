import type { ClueDefinition, CrosswordState, Direction } from './types';
import { buildGrid, cellKey, clueCellKeys } from './grid';
import { isPuzzleSolved, normalizeAnswer } from './validation';

export type CrosswordAction =
  | { type: 'ACTIVATE_CELL'; row: number; col: number }
  | { type: 'ACTIVATE_CLUE'; clueId: string }
  | { type: 'TYPE_LETTER'; letter: string }
  | { type: 'BACKSPACE' }
  | { type: 'MOVE'; deltaRow: number; deltaCol: number }
  | { type: 'RESET' };

export function createInitialState(clues: ClueDefinition[]): CrosswordState {
  const { cells, rows, cols } = buildGrid(clues);
  const first = clues[0];
  return {
    clues,
    cells,
    rows,
    cols,
    activeCellKey: first ? cellKey(first.startRow, first.startCol) : null,
    activeDirection: first ? first.direction : 'across',
    status: 'playing',
  };
}

function resolveDirection(
  cellMemberOf: Partial<Record<Direction, string>>,
  preferred: Direction
): Direction {
  if (cellMemberOf[preferred]) return preferred;
  return cellMemberOf.across ? 'across' : 'down';
}

function activeClueOf(state: CrosswordState): ClueDefinition | undefined {
  if (!state.activeCellKey) return undefined;
  const cell = state.cells[state.activeCellKey];
  const clueId = cell?.memberOf[state.activeDirection];
  return state.clues.find((c) => c.id === clueId);
}

export function crosswordReducer(state: CrosswordState, action: CrosswordAction): CrosswordState {
  switch (action.type) {
    case 'ACTIVATE_CELL': {
      const key = cellKey(action.row, action.col);
      const cell = state.cells[key];
      if (!cell) return state;

      if (key === state.activeCellKey) {
        if (cell.memberOf.across && cell.memberOf.down) {
          return { ...state, activeDirection: state.activeDirection === 'across' ? 'down' : 'across' };
        }
        return state;
      }

      return { ...state, activeCellKey: key, activeDirection: resolveDirection(cell.memberOf, state.activeDirection) };
    }

    case 'ACTIVATE_CLUE': {
      const clue = state.clues.find((c) => c.id === action.clueId);
      if (!clue) return state;
      return { ...state, activeCellKey: cellKey(clue.startRow, clue.startCol), activeDirection: clue.direction };
    }

    case 'TYPE_LETTER': {
      if (state.status !== 'playing') return state;
      if (!state.activeCellKey) return state;
      const letter = normalizeAnswer(action.letter);
      if (!/^[A-Z]$/.test(letter)) return state;

      const cells = { ...state.cells, [state.activeCellKey]: { ...state.cells[state.activeCellKey], typedLetter: letter } };
      let nextState: CrosswordState = { ...state, cells };

      const clue = activeClueOf(nextState);
      if (clue) {
        const keys = clueCellKeys(clue);
        const idx = keys.indexOf(state.activeCellKey);
        if (idx !== -1 && idx < keys.length - 1) {
          nextState = { ...nextState, activeCellKey: keys[idx + 1] };
        }
      }

      nextState = { ...nextState, status: isPuzzleSolved(nextState) ? 'won' : 'playing' };
      return nextState;
    }

    case 'BACKSPACE': {
      if (state.status !== 'playing') return state;
      if (!state.activeCellKey) return state;
      const cell = state.cells[state.activeCellKey];

      if (cell.typedLetter) {
        return { ...state, cells: { ...state.cells, [state.activeCellKey]: { ...cell, typedLetter: '' } } };
      }

      const clue = activeClueOf(state);
      if (!clue) return state;
      const keys = clueCellKeys(clue);
      const idx = keys.indexOf(state.activeCellKey);
      if (idx <= 0) return state;

      const prevKey = keys[idx - 1];
      return {
        ...state,
        activeCellKey: prevKey,
        cells: { ...state.cells, [prevKey]: { ...state.cells[prevKey], typedLetter: '' } },
      };
    }

    case 'MOVE': {
      if (!state.activeCellKey) return state;
      const active = state.cells[state.activeCellKey];
      const targetKey = cellKey(active.row + action.deltaRow, active.col + action.deltaCol);
      const target = state.cells[targetKey];
      if (!target) return state;

      const axisDirection: Direction | null =
        action.deltaCol !== 0 ? 'across' : action.deltaRow !== 0 ? 'down' : null;
      const preferred = axisDirection ?? state.activeDirection;
      return { ...state, activeCellKey: targetKey, activeDirection: resolveDirection(target.memberOf, preferred) };
    }

    case 'RESET':
      return createInitialState(state.clues);

    default:
      return state;
  }
}
