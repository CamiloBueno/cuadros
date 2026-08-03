'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { GameStatus } from '@/lib/hangman/types';

interface ResultModalProps {
  status: Extract<GameStatus, 'won' | 'lost'>;
  word: string;
  open: boolean;
  onRetry: () => void;
  onClose: () => void;
}

export function ResultModal({ status, word, open, onRetry, onClose }: ResultModalProps) {
  const isWon = status === 'won';

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isWon ? '¡Salvaste a Otto!' : 'Otto cayó a la horca'}</DialogTitle>
          <DialogDescription>
            {isWon
              ? `Adivinaste la palabra: ${word}.`
              : `La palabra era: ${word}. ¡Inténtalo de nuevo!`}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cerrar
          </Button>
          <Button onClick={onRetry}>Reintentar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
