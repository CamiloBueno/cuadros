# Memorama (Misión 3 — Parejas ocultas) — Diseño

## Contexto

Proyecto nuevo para un colegio (Asodeca / Colegio Alemán Cali), evento "Einigkeit 2026". Es una app de retos ("misiones") para invitar a egresados a una feria estudiantil conmemorativa. Esta sesión cubre únicamente la primera misión: un juego de memoria (memorama) donde el usuario debe encontrar 9 parejas imagen↔texto relacionadas con recuerdos del colegio, antes de que se agote un temporizador de 3 minutos.

Registro, inicio de sesión, navegación general entre misiones y el shell visual completo (header, breadcrumb, footer) se construyen en sesiones futuras. Esta sesión se enfoca solo en el tablero del memorama como funcionalidad aislada.

## Stack

- **Next.js 15 (App Router) + TypeScript**
- **Tailwind CSS + shadcn/ui** (componentes base: Dialog, Button)
- **Supabase** (Postgres + Storage) como backend, solo lectura pública en esta fase (sin auth todavía)
- **Vitest + React Testing Library** para pruebas unitarias de la lógica del juego

## Arquitectura

- Ruta: `app/misiones/memorama/page.tsx` — **Server Component** que hace `await supabase.from('memory_pairs').select(...)` y pasa los resultados a un Client Component.
- `MemoryGame` — **Client Component**, recibe `pairs` como prop, maneja todo el estado interactivo del juego (barajado, volteo de cartas, timer, resultado).
- El shell de la app (header/breadcrumb/footer del Figma) **no se construye en esta sesión**; se usa un layout mínimo/placeholder alrededor del tablero.

## Modelo de datos (Supabase)

Tabla `memory_pairs`:

| campo | tipo | descripción |
|---|---|---|
| `id` | uuid (PK) | |
| `mission_id` | text | referencia a la misión (valor fijo por ahora, ej. `"mission-3"`) |
| `image_url` | text | URL pública de la imagen (Supabase Storage) |
| `label_text` | text | texto de la pareja (ej. "Biblioteca") |
| `order_index` | int | orden opcional, para consistencia de despliegue |

Cada fila genera **2 cartas** en el juego (una de tipo `image`, otra de tipo `text`), ambas comparten `pairId` = `id` de la fila. Con 9 filas → 18 cartas → grid de 6 columnas × 3 filas, igual al Figma.

Las imágenes se suben a un bucket público de Supabase Storage (ej. `memory-images`); `image_url` guarda la URL pública resultante.

No hay tracking de progreso de usuario en esta fase (no hay auth aún). Esa integración se hará cuando exista login real.

## Lógica del juego (`MemoryGame`)

**Estado:**
- `cards`: 18 cartas barajadas (Fisher-Yates) al montar el componente. Cada carta: `{ id, pairId, type: 'image' | 'text', content, isFlipped, isMatched }`.
- `flippedCards`: cartas actualmente boca arriba sin emparejar (máx. 2 a la vez).
- `matchedPairs`: contador de parejas encontradas.
- `timeLeft`: segundos restantes, arranca en 180 (3:00), countdown vía `setInterval` en `useEffect`.
- `gameStatus`: `'playing' | 'won' | 'lost'`.

**Flujo:**
1. Click en una carta → se voltea si no está ya volteada/emparejada y hay menos de 2 cartas volteadas.
2. Al haber 2 cartas volteadas:
   - Si `pairId` coincide → se marcan `isMatched: true`, aumenta `matchedPairs`.
   - Si no coincide → se muestran ~800ms (clicks bloqueados) y se voltean de nuevo.
3. `matchedPairs === 9` → `gameStatus = 'won'`, se detiene el timer, se abre modal de victoria.
4. `timeLeft === 0` antes de completar → `gameStatus = 'lost'`, se abre modal de derrota.

**Modal de resultado** (shadcn `Dialog`), en ambos casos (victoria y derrota): mensaje temático con la mascota, botón "Reintentar" (resetea y rebaraja el estado) y un botón de continuar/cerrar (por ahora sin navegación real entre misiones, ya que eso se construye después).

**Manejo de errores:** si el fetch a Supabase falla o no devuelve las 9 parejas esperadas, se muestra un estado de error simple en la página en vez del tablero (el juego no puede iniciar sin contenido completo).

## Componentes

- `MemoryGame` — orquestador de estado (client)
- `MemoryCard` — presentacional, recibe estado de una carta + `onClick`
- `Timer` — presentacional, recibe `timeLeft`
- `ResultModal` — shadcn `Dialog`, victoria/derrota con reintentar

## Estilos

Tailwind siguiendo la paleta del Figma: reverso de carta azul oscuro con logo Asodeca, cartas reveladas blancas redondeadas con sombra suave, rojo para acciones y timer en estado crítico. Grid responsivo (6 columnas en desktop, se ajusta en mobile). Animación de flip con `transform: rotateY` vía Tailwind, sin librerías de animación adicionales.

## Testing

Vitest + React Testing Library, enfocado en la lógica del juego:
- Detección de match / no-match al voltear 2 cartas.
- Countdown del timer y transición a `gameStatus: 'lost'` al llegar a 0.
- Transición a `gameStatus: 'won'` al completar las 9 parejas.
- Reinicio del juego desde el modal (reset + rebarajado).

Sin tests end-to-end en esta fase.

## Fuera de alcance (próximas sesiones)

- Registro e inicio de sesión.
- Shell visual completo (header, breadcrumb, footer) tal como en el Figma.
- Persistencia de progreso del usuario en Supabase.
- Navegación real entre misiones.
