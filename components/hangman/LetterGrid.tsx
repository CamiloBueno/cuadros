'use client';

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

interface LetterGridProps {
  guessedLetters: string[];
  wrongLetters: string[];
  disabled: boolean;
  onGuess: (letter: string) => void;
}

export function LetterGrid({ guessedLetters, wrongLetters, disabled, onGuess }: LetterGridProps) {
  return (
    <div className="grid grid-cols-12 gap-2 sm:grid-cols-6">
      {ALPHABET.map((letter) => {
        const isCorrect = guessedLetters.includes(letter);
        const isWrong = wrongLetters.includes(letter);
        const isUsed = isCorrect || isWrong;

        return (
          <button
            key={letter}
            type="button"
            disabled={disabled || isUsed}
            onClick={() => onGuess(letter)}
            className={`aspect-square rounded-lg border-2 font-bold transition-colors disabled:cursor-not-allowed ${
              isCorrect
                ? 'border-green-600 bg-green-50 text-green-700'
                : isWrong
                  ? 'border-red-600 bg-red-50 text-red-700'
                  : 'border-blue-900 text-blue-900 hover:bg-blue-50 disabled:opacity-50'
            }`}
          >
            {letter}
          </button>
        );
      })}
    </div>
  );
}
