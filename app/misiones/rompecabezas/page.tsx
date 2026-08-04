import { createSupabaseServerClient } from '@/lib/supabase/server';
import { PuzzleGame } from '@/components/jigsaw/PuzzleGame';
import { hasExpectedPieceCount, mapRowsToPieces } from '@/lib/jigsaw/pieces';
import type { JigsawPieceRow } from '@/lib/supabase/types';

export const dynamic = 'force-dynamic';

const MISSION_ID = 'mission-7';

export default async function RompecabezasPage() {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from('jigsaw_pieces')
    .select('id, mission_id, image_url, order_index')
    .eq('mission_id', MISSION_ID)
    .order('order_index');

  const rows = (data ?? []) as JigsawPieceRow[];

  if (error || !hasExpectedPieceCount(rows)) {
    return (
      <div className="p-8">
        <p className="text-red-600">No se pudo cargar el rompecabezas. Intenta de nuevo más tarde.</p>
      </div>
    );
  }

  return <PuzzleGame pieces={mapRowsToPieces(rows)} />;
}
