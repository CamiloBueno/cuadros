export interface MemoryPairRow {
  id: string;
  mission_id: string;
  image_url: string;
  label_text: string;
  order_index: number;
}

export interface CrosswordClueRow {
  id: string;
  mission_id: string;
  clue_number: number;
  direction: 'across' | 'down';
  clue_text: string;
  answer: string;
  start_row: number;
  start_col: number;
}

export interface HangmanWordRow {
  id: string;
  mission_id: string;
  word: string;
  order_index: number;
}
