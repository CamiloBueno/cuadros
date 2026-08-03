export type GameStatus = 'playing' | 'won' | 'lost';

export type RabbitPart = 'head' | 'torso' | 'leftArm' | 'rightArm' | 'legs' | 'leftEar' | 'rightEar';

export const RABBIT_PARTS: RabbitPart[] = [
  'head',
  'torso',
  'leftArm',
  'rightArm',
  'legs',
  'leftEar',
  'rightEar',
];

export const MAX_WRONG_GUESSES = RABBIT_PARTS.length;

export interface GameState {
  word: string;
  guessedLetters: string[];
  wrongLetters: string[];
  status: GameStatus;
}
