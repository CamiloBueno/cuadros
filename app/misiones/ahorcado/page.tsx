import { createSupabaseServerClient } from '@/lib/supabase/server';
import { HangmanGame } from '@/components/hangman/HangmanGame';
import { hasWords, mapRowsToWords } from '@/lib/hangman/words';
import type { HangmanWordRow } from '@/lib/supabase/types';

export const dynamic = 'force-dynamic';

const MISSION_ID = 'mission-6';

export default async function AhorcadoPage() {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from('hangman_words')
    .select('id, mission_id, word, order_index')
    .eq('mission_id', MISSION_ID)
    .order('order_index');

  const rows = (data ?? []) as HangmanWordRow[];

  if (error || !hasWords(rows)) {
    return (
      <main className="p-8">
        <p className="text-red-600">No se pudo cargar el ahorcado. Intenta de nuevo más tarde.</p>
      </main>
    );
  }

  return <HangmanGame words={mapRowsToWords(rows)} />;
}
