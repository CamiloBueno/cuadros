import type { ClueDefinition } from '@/lib/crossword/types';

interface ClueListProps {
  clues: ClueDefinition[];
  activeClueId: string | null;
  solvedClueIds: Set<string>;
  onSelect: (clueId: string) => void;
}

function ClueGroup({
  title,
  clues,
  activeClueId,
  solvedClueIds,
  onSelect,
}: {
  title: string;
  clues: ClueDefinition[];
  activeClueId: string | null;
  solvedClueIds: Set<string>;
  onSelect: (clueId: string) => void;
}) {
  if (clues.length === 0) return null;

  return (
    <div>
      <h3 className="font-semibold mb-2">{title}</h3>
      <ul className="space-y-1">
        {clues.map((clue) => (
          <li
            key={clue.id}
            data-testid={`clue-${clue.id}`}
            data-clue-id={clue.id}
            data-active={clue.id === activeClueId}
            data-solved={solvedClueIds.has(clue.id)}
            onClick={() => onSelect(clue.id)}
            className={`cursor-pointer rounded px-2 py-1 ${
              clue.id === activeClueId ? 'bg-yellow-100' : ''
            } ${solvedClueIds.has(clue.id) ? 'text-green-700 line-through' : ''}`}
          >
            <span className="font-medium">{clue.number}.</span> {clue.clueText}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ClueList({ clues, activeClueId, solvedClueIds, onSelect }: ClueListProps) {
  const across = clues.filter((c) => c.direction === 'across').sort((a, b) => a.number - b.number);
  const down = clues.filter((c) => c.direction === 'down').sort((a, b) => a.number - b.number);

  return (
    <div className="space-y-4">
      <ClueGroup title="Horizontales" clues={across} activeClueId={activeClueId} solvedClueIds={solvedClueIds} onSelect={onSelect} />
      <ClueGroup title="Verticales" clues={down} activeClueId={activeClueId} solvedClueIds={solvedClueIds} onSelect={onSelect} />
    </div>
  );
}
