import { createSupabaseServerClient } from '@/lib/supabase/server';
import { CrosswordGame } from '@/components/crossword/CrosswordGame';
import { mapRowsToClues, hasExpectedClueCount } from '@/lib/crossword/clues';
import type { CrosswordClueRow } from '@/lib/supabase/types';

export const dynamic = 'force-dynamic';

const MISSION_ID = 'mission-4';

export default async function CrucigramaPage() {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from('crossword_clues')
    .select('id, mission_id, clue_number, direction, clue_text, answer, start_row, start_col')
    .eq('mission_id', MISSION_ID)
    .order('clue_number');

  const rows = (data ?? []) as CrosswordClueRow[];

  if (error || !hasExpectedClueCount(rows)) {
    return (
      <main className="p-8">
        <p className="text-red-600">No se pudo cargar el crucigrama. Intenta de nuevo más tarde.</p>
      </main>
    );
  }

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-6">Completa el crucigrama</h1>
      <CrosswordGame clues={mapRowsToClues(rows)} />
    </main>
  );
}
