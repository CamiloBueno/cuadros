import { describe, expect, it } from 'vitest';
import { createInitialState, gameReducer } from './reducer';
import { EXPECTED_PIECE_COUNT, type Piece } from './types';

function makePieces(count: number): Piece[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `piece-${i}`,
    correctIndex: i,
    imageUrl: null,
  }));
}

describe('createInitialState', () => {
  it('starts with an empty board, no selection, and playing status', () => {
    const pieces = makePieces(3);
    const state = createInitialState(pieces);
    expect(state.pieces).toEqual(pieces);
    expect(state.board).toEqual(new Array(EXPECTED_PIECE_COUNT).fill(null));
    expect(state.selectedPieceId).toBeNull();
    expect(state.lastError).toBeNull();
    expect(state.status).toBe('playing');
  });
});

describe('gameReducer', () => {
  it('selects a pending piece', () => {
    const state = createInitialState(makePieces(3));
    const next = gameReducer(state, { type: 'SELECT_PIECE', pieceId: 'piece-1' });
    expect(next.selectedPieceId).toBe('piece-1');
  });

  it('ignores selecting a piece that is not pending', () => {
    const state = createInitialState(makePieces(3));
    const next = gameReducer(state, { type: 'SELECT_PIECE', pieceId: 'missing' });
    expect(next).toBe(state);
  });

  it('places a correctly matched piece on its slot and removes it from the tray', () => {
    let state = createInitialState(makePieces(3));
    state = gameReducer(state, { type: 'SELECT_PIECE', pieceId: 'piece-1' });
    state = gameReducer(state, { type: 'PLACE_ATTEMPT', slotIndex: 1 });

    expect(state.board[1]).toBe('piece-1');
    expect(state.pieces.map((p) => p.id)).toEqual(['piece-0', 'piece-2']);
    expect(state.selectedPieceId).toBeNull();
    expect(state.lastError).toBeNull();
    expect(state.status).toBe('playing');
  });

  it('records an error and does not place the piece when the slot is wrong', () => {
    let state = createInitialState(makePieces(3));
    state = gameReducer(state, { type: 'SELECT_PIECE', pieceId: 'piece-1' });
    state = gameReducer(state, { type: 'PLACE_ATTEMPT', slotIndex: 0 });

    expect(state.board[0]).toBeNull();
    expect(state.pieces.map((p) => p.id)).toEqual(['piece-0', 'piece-1', 'piece-2']);
    expect(state.selectedPieceId).toBeNull();
    expect(state.lastError).toEqual({ pieceId: 'piece-1', slotIndex: 0 });
  });

  it('does nothing when placing without a selected piece', () => {
    const state = createInitialState(makePieces(3));
    const next = gameReducer(state, { type: 'PLACE_ATTEMPT', slotIndex: 0 });
    expect(next).toBe(state);
  });

  it('does nothing when attempting to place on an already-filled slot', () => {
    let state = createInitialState(makePieces(3));
    state = gameReducer(state, { type: 'SELECT_PIECE', pieceId: 'piece-0' });
    state = gameReducer(state, { type: 'PLACE_ATTEMPT', slotIndex: 0 });
    state = gameReducer(state, { type: 'SELECT_PIECE', pieceId: 'piece-1' });

    const next = gameReducer(state, { type: 'PLACE_ATTEMPT', slotIndex: 0 });
    expect(next).toBe(state);
  });

  it('wins once every piece has been placed correctly', () => {
    let state = createInitialState(makePieces(EXPECTED_PIECE_COUNT));
    for (let i = 0; i < EXPECTED_PIECE_COUNT; i++) {
      state = gameReducer(state, { type: 'SELECT_PIECE', pieceId: `piece-${i}` });
      state = gameReducer(state, { type: 'PLACE_ATTEMPT', slotIndex: i });
      expect(state.status).toBe(i === EXPECTED_PIECE_COUNT - 1 ? 'won' : 'playing');
    }
    expect(state.pieces).toEqual([]);
  });

  it('ignores SELECT_PIECE and PLACE_ATTEMPT once the game is won', () => {
    const pieces = makePieces(EXPECTED_PIECE_COUNT);
    let state = createInitialState(pieces);
    for (let i = 0; i < EXPECTED_PIECE_COUNT; i++) {
      state = gameReducer(state, { type: 'SELECT_PIECE', pieceId: `piece-${i}` });
      state = gameReducer(state, { type: 'PLACE_ATTEMPT', slotIndex: i });
    }
    expect(state.status).toBe('won');

    const afterSelect = gameReducer(state, { type: 'SELECT_PIECE', pieceId: 'piece-0' });
    expect(afterSelect).toBe(state);

    const afterPlace = gameReducer(state, { type: 'PLACE_ATTEMPT', slotIndex: 0 });
    expect(afterPlace).toBe(state);
  });

  it('resets to a freshly shuffled set of pieces and clears the board', () => {
    let state = createInitialState(makePieces(3));
    state = gameReducer(state, { type: 'SELECT_PIECE', pieceId: 'piece-0' });
    state = gameReducer(state, { type: 'PLACE_ATTEMPT', slotIndex: 0 });

    const newPieces = makePieces(3);
    state = gameReducer(state, { type: 'RESET', pieces: newPieces });
    expect(state).toEqual(createInitialState(newPieces));
  });
});
