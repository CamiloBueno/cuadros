'use client';

import { useEffect, useReducer, useState } from 'react';
import { MissionShell } from '@/components/misiones/MissionShell';
import { WordDisplay } from './WordDisplay';
import { LetterGrid } from './LetterGrid';
import { Rabbit } from './Rabbit';
import { ResultModal } from './ResultModal';
import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';
import { createInitialState, gameReducer } from '@/lib/hangman/reducer';
import { pickRandomWord } from '@/lib/hangman/words';

interface HangmanGameProps {
  words: string[];
}

export function HangmanGame({ words }: HangmanGameProps) {
  const [state, dispatch] = useReducer(gameReducer, words[0], createInitialState);
  const [modalDismissed, setModalDismissed] = useState(false);

  useEffect(() => {
    dispatch({ type: 'RESET', word: pickRandomWord(words) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleGuess(letter: string) {
    dispatch({ type: 'GUESS_LETTER', letter });
  }

  function handleRetry() {
    dispatch({ type: 'RESET', word: pickRandomWord(words) });
    setModalDismissed(false);
  }

  const isGameOver = state.status === 'won' || state.status === 'lost';

  return (
    <MissionShell
      missionNumber={6}
      missionName="Galgenmännchen"
      title="Juego del ahorcado"
      description="Adivina la palabra en alemán. ¿Salvas a Otto o cae a la horca?"
      backHref="/"
      footerActions={
        <Button variant="outline" onClick={handleRetry}>
          <RotateCcw className="size-4" />
          Reiniciar
        </Button>
      }
    >
      <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-8">
          <WordDisplay word={state.word} guessedLetters={state.guessedLetters} />
          <div>
            <p className="mb-3 text-sm text-muted-foreground">Selecciona la letra:</p>
            <LetterGrid
              guessedLetters={state.guessedLetters}
              wrongLetters={state.wrongLetters}
              disabled={isGameOver}
              onGuess={handleGuess}
            />
          </div>
        </div>
        <Rabbit wrongLetters={state.wrongLetters} />
      </div>

      {(state.status === 'won' || state.status === 'lost') && (
        <ResultModal
          status={state.status}
          word={state.word}
          open={!modalDismissed}
          onRetry={handleRetry}
          onClose={() => setModalDismissed(true)}
        />
      )}
    </MissionShell>
  );
}
