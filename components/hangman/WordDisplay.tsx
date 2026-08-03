interface WordDisplayProps {
  word: string;
  guessedLetters: string[];
}

export function WordDisplay({ word, guessedLetters }: WordDisplayProps) {
  return (
    <div className="flex flex-wrap gap-3">
      {word.split('').map((letter, index) => {
        const isRevealed = guessedLetters.includes(letter);
        return (
          <span
            key={`${letter}-${index}`}
            data-testid="word-slot"
            className="flex w-6 justify-center border-b-2 border-blue-900 pb-1 text-2xl font-bold text-green-700"
          >
            {isRevealed ? letter : ''}
          </span>
        );
      })}
    </div>
  );
}
