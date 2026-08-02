interface TimerProps {
  secondsLeft: number;
}

export function Timer({ secondsLeft }: TimerProps) {
  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const formatted = `${minutes}:${seconds.toString().padStart(2, '0')}`;
  const isCritical = secondsLeft <= 30;

  return (
    <span className={`text-3xl font-bold ${isCritical ? 'text-red-600' : 'text-gray-900'}`}>
      {formatted}
    </span>
  );
}
