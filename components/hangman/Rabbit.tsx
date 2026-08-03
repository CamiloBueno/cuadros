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
      <div data-testid="gallows" aria-hidden="true" className="absolute inset-0 z-0">
        {/* base */}
        <div className="absolute bottom-0 left-[78%] h-3 w-28 -translate-x-1/2 rounded-sm bg-amber-950" />
        {/* vertical post */}
        <div className="absolute top-0 left-[78%] h-full w-5 -translate-x-1/2 rounded-sm bg-amber-800" />
        {/* horizontal beam */}
        <div className="absolute top-8 left-1/2 h-5 w-[35%] rounded-sm bg-amber-800" />
        {/* rope */}
        <div className="absolute top-8 left-1/2 h-14 w-1 -translate-x-1/2 bg-stone-300" />
        {/* noose loop */}
        <div className="absolute top-[4.75rem] left-1/2 h-6 w-6 -translate-x-1/2 rounded-full border-2 border-stone-300" />
      </div>
      {visibleParts.map((part) => (
        <Image
          key={part}
          data-testid="rabbit-part"
          data-part={part}
          src={PART_ASSET[part]}
          alt=""
          width={200}
          height={280}
          className={`absolute z-10 h-auto ${PART_STYLE[part]}`}
        />
      ))}
    </div>
  );
}
