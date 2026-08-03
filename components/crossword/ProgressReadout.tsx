interface ProgressReadoutProps {
  solvedCount: number;
  totalCount: number;
}

export function ProgressReadout({ solvedCount, totalCount }: ProgressReadoutProps) {
  return (
    <p className="font-semibold">
      Has encontrado {solvedCount} de {totalCount} palabras
    </p>
  );
}
