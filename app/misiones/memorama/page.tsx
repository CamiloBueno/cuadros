import { createSupabaseServerClient } from '@/lib/supabase/server';
import { MemoryGame } from '@/components/memory/MemoryGame';
import { mapRowsToPairs, hasExpectedPairCount } from '@/lib/game/pairs';
import type { MemoryPairRow } from '@/lib/supabase/types';
import { MissionShell } from '@/components/misiones/MissionShell';

export const dynamic = 'force-dynamic';

const MISSION_ID = 'mission-3';

export default async function MemoramaPage() {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from('memory_pairs')
    .select('id, mission_id, image_url, label_text, order_index')
    .eq('mission_id', MISSION_ID)
    .order('order_index');

  const rows = (data ?? []) as MemoryPairRow[];

  if (error || !hasExpectedPairCount(rows)) {
    return (
      <div className="p-8">
        <p className="text-red-600">No se pudo cargar el memorama. Intenta de nuevo más tarde.</p>
      </div>
    );
  }

  return (
    <MissionShell
      missionNumber={3}
      missionName="Parejas ocultas"
      title="Memorama"
      description="Encuentra las parejas antes de que se acabe el tiempo."
      backHref="/"
    >
      <MemoryGame pairs={mapRowsToPairs(rows)} />
    </MissionShell>
  );
}
