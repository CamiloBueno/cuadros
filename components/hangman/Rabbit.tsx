import Image from 'next/image';
import { RABBIT_PARTS, type RabbitPart } from '@/lib/hangman/types';

const PART_ASSET: Record<RabbitPart, string> = {
  head: '/misiones/ahorcado/head.png',
  torso: '/misiones/ahorcado/torso.png',
  leftArm: '/misiones/ahorcado/left-arm.png',
  rightArm: '/misiones/ahorcado/right-arm.png',
  legs: '/misiones/ahorcado/legs.png',
  leftEar: '/misiones/ahorcado/left-ear.png',
  rightEar: '/misiones/ahorcado/right-ear.png',
};

const PART_STYLE: Record<RabbitPart, string> = {
  head: 'left-1/2 top-16 w-24 -translate-x-1/2',
  torso: 'left-1/2 top-36 w-28 -translate-x-1/2',
  leftArm: 'left-[38%] top-40 w-10 -translate-x-full',
  rightArm: 'left-[62%] top-40 w-10',
  legs: 'left-1/2 top-64 w-28 -translate-x-1/2',
  leftEar: 'left-[46%] top-4 w-8 -translate-x-full -rotate-6',
  rightEar: 'left-[54%] top-4 w-8 rotate-6',
};

interface RabbitProps {
  wrongLetters: string[];
}

export function Rabbit({ wrongLetters }: RabbitProps) {
  const visibleParts = RABBIT_PARTS.slice(0, wrongLetters.length);

  return (
    <div className="relative h-96 w-72">
      {visibleParts.map((part) => (
        <Image
          key={part}
          data-testid="rabbit-part"
          src={PART_ASSET[part]}
          alt={part}
          width={200}
          height={280}
          className={`absolute ${PART_STYLE[part]}`}
        />
      ))}
    </div>
  );
}
