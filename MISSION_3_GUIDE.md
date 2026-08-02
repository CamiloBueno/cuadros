# Guía: reutilizar el memorama (misión 3) en otro proyecto de Supabase

Esta guía es para alguien que quiere copiar la lógica del juego de memoria
("misión 3") a **otro repo con su propio proyecto de Supabase**, donde nada
de esto existe todavía (ni la tabla, ni las policies, ni las env vars).

Asume un stack destino Next.js (App Router) + TypeScript + Tailwind, igual
al de este repo. Si tu stack es distinto, la sección 5 explica qué es
específico de Next.js/React.

## 1. Archivos a copiar

Copia estas carpetas/archivos tal cual al otro proyecto (mismos paths, para
que los imports `@/...` no se rompan, o ajusta los imports si usas otro alias):

```
lib/game/types.ts
lib/game/shuffle.ts
lib/game/reducer.ts
lib/game/pairs.ts
lib/supabase/server.ts
lib/supabase/types.ts
lib/utils.ts                    # helper cn() — solo si no lo tienes ya
components/memory/MemoryGame.tsx
components/memory/MemoryCard.tsx
components/memory/Timer.tsx
components/memory/ResultModal.tsx
components/ui/button.tsx        # shadcn — solo si no lo tienes ya
components/ui/dialog.tsx        # shadcn — solo si no lo tienes ya
app/misiones/memorama/page.tsx  # server component, punto de entrada
```

**Importante sobre `shuffle.ts` y `MemoryGame.tsx`:** el estado inicial del
juego se construye con `buildOrderedDeck()` (sin barajar) y el barajado real
(`buildDeck()`) se dispara en un `useEffect` con deps `[]` después del
montaje. Esto es a propósito — si el barajado (`Math.random()`) se ejecuta
durante el render inicial, el HTML de servidor y el del cliente difieren y
React tira un **hydration mismatch**. No "simplifiques" esto barajando en el
`useReducer` init.

## 2. Dependencias npm que necesita

```bash
npm install @supabase/supabase-js @base-ui/react class-variance-authority clsx tailwind-merge lucide-react
```

- `@supabase/supabase-js` — cliente de Supabase.
- `@base-ui/react`, `class-variance-authority`, `clsx`, `tailwind-merge`,
  `lucide-react` — dependencias de los componentes `button.tsx` / `dialog.tsx`
  (shadcn/ui). Si tu amigo ya tiene su propio sistema de componentes con
  otro `Dialog`/`Button`, puede usar el suyo en vez de copiar estos dos
  archivos — solo tiene que respetar las props que usa `ResultModal.tsx`
  (`open`, `onOpenChange`/`onClose`, `onRetry`).

No hace falta tocar `next.config.ts` — `MemoryCard.tsx` usa
`<Image unoptimized>`, así que no requiere configurar `images.domains`.

## 3. Configuración en el **otro** proyecto de Supabase

Esto es lo que hay que recrear desde cero porque no existe en el proyecto
nuevo:

### 3.1 Tabla + RLS (migración)

Ejecuta esto en su proyecto (SQL editor del dashboard, `supabase db query`,
o el MCP `apply_migration`):

```sql
create table if not exists memory_pairs (
  id uuid primary key default gen_random_uuid(),
  mission_id text not null,
  image_url text not null,
  label_text text not null,
  order_index int not null default 0
);

alter table memory_pairs enable row level security;

create policy "Public read access to memory_pairs"
  on memory_pairs
  for select
  using (true);
```

Si en su proyecto ya existe una tabla `memory_pairs` con otro propósito,
renómbrala en este SQL y también en:
- `app/misiones/memorama/page.tsx` (`.from('memory_pairs')`)
- `lib/supabase/types.ts` (nombre del tipo, si quiere)

La policy es de **lectura pública** a propósito: el juego se consulta desde
un server component con la `anon key`, sin sesión de usuario. Si su tabla va
a tener otro tipo de datos sensibles, no reutilicen esta tabla — creen una
nueva.

### 3.2 Seed de datos

```sql
insert into memory_pairs (mission_id, image_url, label_text, order_index) values
  ('mission-3', 'https://.../img1.png', 'Etiqueta 1', 1),
  ('mission-3', 'https://.../img2.png', 'Etiqueta 2', 2),
  -- ... 9 filas en total con el MISMO mission_id
  ('mission-3', 'https://.../img9.png', 'Etiqueta 9', 9);
```

**Tiene que insertar exactamente el mismo número de filas que espera el
código**, o ajustarlo (ver sección 4). Con la config actual son **9 pares**
(18 cartas, grid de 6 columnas).

### 3.3 Exposición a la API / Data API settings

Si en su proyecto la Data API restringe qué tablas son accesibles, hay que
dar acceso explícito a `anon`/`authenticated` sobre `memory_pairs` además de
la RLS (RLS controla filas, no si la tabla es alcanzable). Verificar en
`Project Settings → API → Data API` o vía Postgres:

```sql
grant select on memory_pairs to anon, authenticated;
```

### 3.4 Verificación de seguridad

Después de crear la tabla, correr advisors (`supabase db advisors` o MCP
`get_advisors type=security`) para confirmar que no queda ninguna tabla
expuesta sin RLS.

## 4. Ajustar constantes específicas de esta implementación

Estos valores están **hardcodeados** para la misión 3 de este proyecto —
tu amigo casi seguro los quiere cambiar:

| Dónde | Qué | Para qué sirve |
|---|---|---|
| `app/misiones/memorama/page.tsx` | `MISSION_ID = 'mission-3'` | filtro `.eq('mission_id', ...)` — cámbialo al identificador que uses en tu propio seed |
| `lib/game/pairs.ts` | `EXPECTED_PAIR_COUNT = 9` | si insertas más o menos pares, la página muestra el mensaje de error hasta que este número coincida con las filas devueltas |
| `components/memory/MemoryGame.tsx` | `grid-cols-6` | pensado para 18 cartas (9 pares); con otro número de pares, ajustar el grid |
| `lib/game/reducer.ts` | `TIME_LIMIT_SECONDS = 180` | límite de tiempo del juego |

## 5. Variables de entorno del **nuevo** proyecto

En el nuevo repo, crear `.env.local` (nunca commitear, agregar `.env*` al
`.gitignore` si no está) apuntando a **su propio** proyecto de Supabase, no
al tuyo:

```
NEXT_PUBLIC_SUPABASE_URL=https://<su-project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<su anon/publishable key>
```

Sacar estos valores de `Project Settings → API` en el dashboard de **su**
proyecto. Usar siempre la **anon/publishable key**, nunca la `service_role`
— `lib/supabase/server.ts` la usa desde un server component, pero como
sigue siendo la clave pública (por eso el prefijo `NEXT_PUBLIC_`), la
seguridad real la da la RLS policy de la sección 3.1, no la clave.

## 6. Qué es específico de Next.js / React (por si su stack es distinto)

- `app/misiones/memorama/page.tsx` es un **Server Component** de Next.js
  (App Router) — hace el fetch a Supabase en el servidor antes de renderizar.
  En otro framework, hay que portar esa query a donde corresponda (loader,
  `getServerSideProps`, endpoint API, etc.) y pasarle los `pairs` mapeados
  al componente de juego.
- `MemoryGame.tsx` es un **Client Component** (`'use client'`) que usa
  `useReducer`/`useEffect` de React — la lógica del reducer (`reducer.ts`)
  y el shuffle (`shuffle.ts`) son JS puro, sin dependencias de React, así
  que se pueden reusar en cualquier framework de UI.
- `ResultModal.tsx` depende de shadcn/ui (`@base-ui/react`) — si su stack no
  usa shadcn, reemplazar por su propio componente modal, respetando la
  interfaz de props (`open`, `onClose`, `onRetry`, `status`).

## 7. Checklist final antes de dar por listo

- [ ] Tabla `memory_pairs` creada con RLS + policy de lectura pública en su proyecto.
- [ ] Seed insertado, con el mismo `mission_id` que usa el código.
- [ ] `EXPECTED_PAIR_COUNT` y `MISSION_ID` ajustados si cambió la cantidad de pares.
- [ ] `.env.local` con la URL y anon key **de su propio proyecto**, no commiteado.
- [ ] `npm run dev` y abrir `/misiones/memorama` — el tablero carga sin errores en consola.
- [ ] Sin errores de hydration mismatch (si aparecen, revisar que `shuffle.ts`/`MemoryGame.tsx` se copiaron completos, ver sección 1).
- [ ] `supabase db advisors` (o MCP `get_advisors`) sin hallazgos de seguridad nuevos.
