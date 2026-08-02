import Image from 'next/image';
import type { MemoryCardData } from '@/lib/game/types';

interface MemoryCardProps {
  card: MemoryCardData;
  onClick: (cardId: string) => void;
  disabled: boolean;
}

export function MemoryCard({ card, onClick, disabled }: MemoryCardProps) {
  const isRevealed = card.isFlipped || card.isMatched;

  return (
    <button
      type="button"
      aria-label={isRevealed ? `Carta revelada: ${card.type === 'text' ? card.content : 'imagen'}` : 'Carta oculta'}
      data-card-id={card.id}
      disabled={disabled || card.isMatched}
      onClick={() => onClick(card.id)}
      className={`aspect-square rounded-xl border-2 flex items-center justify-center p-2 transition-colors ${
        isRevealed ? 'bg-white border-gray-200 shadow-sm' : 'bg-blue-900 border-blue-800 hover:bg-blue-800'
      } ${card.isMatched ? 'opacity-60' : ''}`}
    >
      {isRevealed ? (
        card.type === 'image' ? (
          <Image src={card.content} alt="" width={120} height={120} className="object-cover rounded-lg" unoptimized />
        ) : (
          <span className="text-center font-semibold text-gray-900">{card.content}</span>
        )
      ) : (
        <span className="text-yellow-400 text-2xl">•</span>
      )}
    </button>
  );
}
