export type Direction = 'across' | 'down';

export interface ClueDefinition {
  id: string;
  number: number;
  direction: Direction;
  clueText: string;
  answer: string;
  startRow: number;
  startCol: number;
}

export interface GridCell {
  row: number;
  col: number;
  solutionLetter: string;
  typedLetter: string;
  clueNumbers: number[];
  memberOf: Partial<Record<Direction, string>>;
}

export type GameStatus = 'playing' | 'won';

export interface CrosswordState {
  clues: ClueDefinition[];
  cells: Record<string, GridCell>;
  rows: number;
  cols: number;
  activeCellKey: string | null;
  activeDirection: Direction;
  status: GameStatus;
}
