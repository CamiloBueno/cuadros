# Rompecabezas (Misión 7 — Puzzle) — Diseño

## Contexto

Séptima misión del sitio Einheit 2026: un rompecabezas donde el jugador arma un tablero
de 3×4 (12 piezas) seleccionando piezas de una bandeja lateral y colocándolas en el slot
correcto del tablero. La guía visual (`mission7-visual-guide/*.jpeg`) muestra un tablero
grande a la izquierda con huecos con forma de pieza de rompecabezas, y una bandeja a la
derecha con piezas apiladas y flechas ↑/↓ para desplazarse entre ellas.

Este MVP se construye **sin imágenes reales** (para no cargar el desarrollo con assets
todavía): cada pieza se representa como un bloque de color sólido + su número de
posición. La lógica de juego (selección, colocación, validación, victoria) queda
completamente desacoplada del diseño visual, para que otro desarrollador/diseñador
reemplace después el placeholder por piezas recortadas de una imagen real (la tabla
Supabase ya deja `image_url` listo para eso). Se sigue exactamente el patrón arquitectónico
establecido por memorama/ahorcado/crucigrama, incluyendo el `MissionShell` compartido.

Decisiones ya confirmadas con el usuario:
- Interacción: clic para seleccionar pieza en la bandeja + clic en el slot destino (no
  drag & drop).
- Pieza incorrecta en un slot: feedback visual de error (breve) y la pieza se deselecciona,
  vuelve a quedar disponible en la bandeja. No cuenta como "intento fallido" con límite.
- Piezas: bloques de color sólido + número de índice (no formas de rompecabezas reales,
  no imágenes).
- Tablero: 3 filas × 4 columnas = 12 piezas.
- Fuente de datos: tabla Supabase propia (`jigsaw_pieces`), con `image_url` nullable,
  igual patrón que las demás misiones, lista para que el diseñador solo llene `image_url`
  después.
- Bandeja: las piezas ya colocadas correctamente desaparecen de la bandeja (no quedan
  marcadas/deshabilitadas).
- Ruta: `app/misiones/rompecabezas`.
- Sin condición de derrota (ni tiempo ni intentos limitados) — solo estados `playing` /
  `won`.

Registro/login real y tracking de puntaje hacia el sistema de puntos del README quedan
fuera de alcance, igual que en las demás misiones.

## Stack

- Next.js 15 (App Router) + TypeScript
- Tailwind CSS + shadcn/ui (Dialog, Button — reutilizados de memorama/ahorcado)
- Supabase (Postgres), solo lectura pública (sin auth todavía)
- Vitest + React Testing Library

## Arquitectura

- `app/misiones/rompecabezas/page.tsx` — Server Component. `MISSION_ID = 'mission-7'`,
  `export const dynamic = 'force-dynamic'`. Hace
  `supabase.from('jigsaw_pieces').select('id, mission_id, image_url, order_index').eq('mission_id', MISSION_ID).order('order_index')`,
  valida con `hasExpectedPieceCount(rows)` (debe ser igual a `PUZZLE_ROWS * PUZZLE_COLS`),
  en caso de error/conteo inválido renderiza un `<div>` de error simple (mismo patrón que
  memorama), mapea con `mapRowsToPieces(rows)` y pasa el array a
  `<PuzzleGame pieces={...} />` (Client Component). `MissionShell` se instancia dentro de
  `PuzzleGame` (client), igual que en ahorcado, porque necesita pasar el botón "Reiniciar"
  al slot `footerActions`.
- `components/jigsaw/PuzzleGame.tsx` — Client Component orquestador: `useReducer` con
  `gameReducer`/`createInitialState`, maneja el `useEffect([])` de barajado post-montaje,
  renderiza `MissionShell`, `PuzzleBoard`, `PieceTray` y `ResultModal`.
- `components/jigsaw/PuzzleBoard.tsx` — grilla de `PUZZLE_ROWS × PUZZLE_COLS` slots.
  Recibe `board`, `onSlotClick(index)`, `errorSlotIndex` (para animar el slot que acaba de
  fallar). Cada slot: vacío (contorno punteado tipo placeholder) o con `PuzzlePiece`
  colocada.
- `components/jigsaw/PieceTray.tsx` — panel lateral. Recibe `pieces` pendientes (ya en
  orden barajado desde el estado), `selectedPieceId`, `onSelectPiece(id)`. Pagina la lista
  mostrando una ventana de ~3 piezas con botones ↑/↓ (estado de paginación es local del
  componente — `useState`, no forma parte del reducer de juego).
- `components/jigsaw/PuzzlePiece.tsx` — presentacional, reutilizado en tray y board:
  bloque de color (de una paleta fija indexada por `correctIndex % palette.length`) +
  número; variante `selected`/`error` vía prop.
- `components/jigsaw/ResultModal.tsx` — modal de victoria (shadcn `Dialog`), botón
  "Reintentar" (dispatch `RESET`).
- `lib/jigsaw/types.ts` — constantes (`PUZZLE_ROWS = 3`, `PUZZLE_COLS = 4`,
  `EXPECTED_PIECE_COUNT = PUZZLE_ROWS * PUZZLE_COLS`, paleta de colores placeholder) y
  tipos (`Piece`, `GameState`, `GameAction`).
- `lib/jigsaw/pieces.ts` — `mapRowsToPieces(rows: JigsawPieceRow[]): Piece[]`,
  `hasExpectedPieceCount(rows)`, `shufflePieces(pieces)` (reutiliza `shuffleArray` de
  `lib/game/shuffle.ts`), `getPlaceholderColor(correctIndex)`.
- `lib/jigsaw/reducer.ts` — `createInitialState(pieces)`, `gameReducer(state, action)`.
- `lib/supabase/types.ts` — se agrega `JigsawPieceRow { id: string; mission_id: string;
  image_url: string | null; order_index: number }`.

## Modelo de datos (Supabase)

Tabla `jigsaw_pieces`:

| campo | tipo | descripción |
|---|---|---|
| `id` | uuid (PK) | |
| `mission_id` | text | `"mission-7"` |
| `image_url` | text, nullable | vacío en este MVP; el diseñador la llena luego con la porción de imagen real correspondiente a esa pieza |
| `order_index` | int | posición correcta en el tablero (0..11); también determina el color/número placeholder |

RLS habilitado con policy de `select` pública (`using (true)`), más
`grant select on jigsaw_pieces to anon, authenticated;` — mismo patrón que
`memory_pairs`/`hangman_words`. Seed: 12 filas con `image_url = null`, `order_index` 0..11,
`mission_id = 'mission-7'`.

No hay tracking de progreso de usuario en esta fase.

## Lógica del juego (`lib/jigsaw/`)

Framework-free, con tests — mismo espíritu que `lib/game/reducer.ts` / `lib/hangman/reducer.ts`.

**Constantes** (`types.ts`):
- `PUZZLE_ROWS = 3`, `PUZZLE_COLS = 4`, `EXPECTED_PIECE_COUNT = 12`.
- Paleta fija de colores placeholder (ej. array de 12 valores Tailwind/hex).

**Estado (`GameState`)**:
- `pieces: Piece[]` — piezas pendientes en la bandeja, en el orden actual (barajado tras
  el montaje).
- `board: (string | null)[]` — longitud `EXPECTED_PIECE_COUNT`, cada slot contiene el
  `id` de la pieza colocada o `null`.
- `selectedPieceId: string | null`.
- `lastError: { pieceId: string; slotIndex: number } | null` — info transitoria para que
  el componente dispare la animación de error; se sobreescribe/limpia en cada acción
  siguiente, no requiere una acción de limpieza separada.
- `status: 'playing' | 'won'`.

**Flujo (reducer puro)**:
1. `SELECT_PIECE { pieceId }`: no-op si `status !== 'playing'`. Si la pieza está en
   `pieces` (pendiente), la marca como `selectedPieceId` y limpia `lastError`.
2. `PLACE_ATTEMPT { slotIndex }`: no-op si `status !== 'playing'`, si no hay
   `selectedPieceId`, o si el slot ya está ocupado. Si `pieza.correctIndex === slotIndex`
   → se remueve de `pieces`, se coloca en `board[slotIndex]`, se limpia `selectedPieceId`
   y `lastError`; si todos los slots quedan llenos → `status = 'won'`. Si no coincide →
   se limpia `selectedPieceId`, se setea `lastError = { pieceId, slotIndex }`, el tablero
   no cambia.
3. `RESET { pieces }`: recibe una lista ya barajada de piezas, limpia `board` (todo
   `null`), `selectedPieceId`, `lastError`, y pone `status = 'playing'`.

**Barajado y seguridad de hidratación**: `createInitialState(pieces)` usa las piezas en
el orden recibido (orden `order_index`, sin barajar) — determinista, para que el HTML de
servidor y el primer render de cliente coincidan. `PuzzleGame` inicializa el `useReducer`
de forma perezosa con este estado determinista, y en un `useEffect(() => {...}, [])`
dispara `RESET` con `shufflePieces(pieces)` (que reutiliza `shuffleArray` de
`lib/game/shuffle.ts`) para barajar de verdad solo después del montaje — mismo patrón que
`buildDeck` en memorama y `pickRandomWord` en ahorcado.

**Manejo de errores de datos**: si el fetch a Supabase falla o no hay 12 filas, la página
muestra un estado de error simple en vez del tablero (igual que memorama/ahorcado).

## Componentes

- `PuzzleGame` — orquestador de estado (client), maneja el `useEffect` de barajado inicial
  y el "Reiniciar" (dispatch `RESET` con nuevo `shufflePieces`).
- `PuzzleBoard` — grilla de slots, delega el clic de cada slot a `onSlotClick`.
- `PieceTray` — lista paginada (ventana + botones ↑/↓) de piezas pendientes, delega el
  clic de cada pieza a `onSelectPiece`.
- `PuzzlePiece` — presentacional: bloque de color + número; variantes `selected`/`error`.
- `ResultModal` — mensaje de victoria + botón "Reintentar".
- `MissionShell` — chrome reutilizable ya existente (breadcrumb, título, footer).

## Estilos

Tablero con borde azul oscuro grueso y esquinas redondeadas (fiel a la guía), fondo crema
tanto en slots vacíos como detrás del tablero. Slots vacíos: contorno punteado sutil (sin
intentar simular la muesca de rompecabezas real — eso queda para el diseñador). Piezas
colocadas/en bandeja: bloque de color sólido de la paleta fija + número centrado, bordes
redondeados pequeños. Estado `selected`: anillo/borde azul. Estado `error`: breve
animación (shake + borde rojo, ~400-600ms vía CSS, sin manejar el "apagado" en el
reducer). Bandeja: panel blanco redondeado con sombra, botones ↑/↓ tipo shadcn `Button`
variante icon. Responsivo: en mobile la bandeja pasa a fila horizontal debajo del tablero
(igual criterio de reflow que otras misiones).

## Testing

Vitest + React Testing Library:
- `lib/jigsaw/reducer.test.ts`: estado inicial (sin barajar, tablero vacío, `playing`);
  `SELECT_PIECE` solo selecciona piezas pendientes y no hace nada si el juego ya se ganó;
  `PLACE_ATTEMPT` correcto mueve la pieza al tablero y la saca de la bandeja; `PLACE_ATTEMPT`
  incorrecto no modifica el tablero, limpia selección y setea `lastError`; victoria al
  colocar la última pieza correctamente; acciones no-op después de `won`; `RESET` rebaraja
  y reinicia todo el estado.
- `lib/jigsaw/pieces.test.ts`: `mapRowsToPieces` mapea filas correctamente;
  `hasExpectedPieceCount` valida el conteo exacto; `shufflePieces` preserva todas las
  piezas sin duplicar/perder (usa `shuffleArray` ya testeado); `getPlaceholderColor` es
  determinista por índice.
- `components/jigsaw/PuzzleBoard.test.tsx`: renderiza el número correcto de slots,
  distingue vacío vs. ocupado, dispara `onSlotClick` con el índice correcto.
- `components/jigsaw/PieceTray.test.tsx`: pagina correctamente con ↑/↓, marca la pieza
  seleccionada, dispara `onSelectPiece`.
- `components/jigsaw/PuzzleGame.test.tsx`: integración — seleccionar pieza + clic en slot
  correcto la coloca y la saca de la bandeja; clic en slot incorrecto no coloca nada y
  dispara el estado de error; completar el tablero muestra `ResultModal`.

Sin tests end-to-end en esta fase.

## Fuera de alcance (próximas sesiones)

- Piezas con forma real de rompecabezas (SVG con muescas/interlocking).
- Recorte real de imágenes en piezas (usar `image_url` para renderizar la porción
  correspondiente vía `background-position`/crop).
- Drag & drop como mecanismo de colocación alternativo/adicional.
- Temporizador o límite de intentos fallidos.
- Sistema de cuentas real detrás de "Mi cuenta".
- Tracking de puntaje/ranking hacia el sistema de puntos del README.
- Registro e inicio de sesión.
