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

interface ResultModalProps {
  open: boolean;
  onRetry: () => void;
  onClose: () => void;
}

export function ResultModal({ open, onRetry, onClose }: ResultModalProps) {
  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>¡Completaste el rompecabezas!</DialogTitle>
          <DialogDescription>Armaste todas las piezas en el lugar correcto.</DialogDescription>
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
