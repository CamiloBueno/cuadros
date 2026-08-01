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
import type { GameStatus } from '@/lib/game/types';

interface ResultModalProps {
  status: Extract<GameStatus, 'won' | 'lost'>;
  open: boolean;
  onRetry: () => void;
  onClose: () => void;
}

export function ResultModal({ status, open, onRetry, onClose }: ResultModalProps) {
  const isWon = status === 'won';

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isWon ? '¡Encontraste todas las parejas!' : 'Se acabó el tiempo'}</DialogTitle>
          <DialogDescription>
            {isWon
              ? 'Completaste la misión antes de que se acabara el tiempo.'
              : 'No alcanzaste a encontrar todas las parejas. ¡Inténtalo de nuevo!'}
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
