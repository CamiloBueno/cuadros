# Guía: reutilizar el crucigrama (misión 4) en otro proyecto de Supabase

Esta guía es para alguien que quiere copiar la lógica del crucigrama ("misión 4")
a **otro repo con su propio proyecto de Supabase**, donde nada de esto existe
todavía (ni la tabla, ni las policies, ni las env vars).

Asume un stack destino Next.js (App Router) + TypeScript + Tailwind, igual al de
este repo. Si tu stack es distinto, la sección 6 explica qué es específico de
Next.js/React.

## 1. Archivos a copiar

Copia estas carpetas/archivos tal cual al otro proyecto (mismos paths, para que
los imports `@/...` no se rompan, o ajusta los imports si usas otro alias):

```
lib/crossword/types.ts
lib/crossword/grid.ts
lib/crossword/validation.ts
lib/crossword/reducer.ts
lib/crossword/clues.ts
lib/supabase/server.ts
lib/supabase/types.ts           # solo la interfaz CrosswordClueRow
lib/utils.ts                    # helper cn() — solo si no lo tienes ya
components/crossword/CrosswordCell.tsx
components/crossword/CrosswordGrid.tsx
components/crossword/ClueList.tsx
components/crossword/ProgressReadout.tsx
components/crossword/CrosswordGame.tsx
app/misiones/crucigrama/page.tsx   # server component, punto de entrada
```

**A diferencia de la misión 3 (memorama), aquí no hay ningún archivo de
"shuffle"**: la grilla del crucigrama es estática (se calcula una sola vez a
partir de las clues, sin `Math.random()`), así que `buildGrid()` y
`createInitialState()` son 100% deterministas y seguras tanto en el servidor
como en el primer render del cliente. El único punto realmente client-only es
el **foco imperativo del input activo** en `CrosswordGame.tsx`
(`cellRefs.current.get(state.activeCellKey)?.focus()`), que vive dentro de un
`useEffect` disparado por `state.activeCellKey` — nunca lo muevas a que se
ejecute durante el render, o el foco podría desincronizarse del estado.

## 2. Dependencias npm que necesita

Ninguna dependencia nueva: los inputs de la grilla son `<input>` nativos con
manejo de teclado en React puro. Si tu proyecto ya tiene el mismo stack base
que este repo (Next.js + TypeScript + Tailwind), no necesitas instalar nada
adicional para esta misión. (Esto es distinto a la misión 3, que sí necesita
`@base-ui/react`/`class-variance-authority`/etc. para su modal — el crucigrama
no usa ningún modal ni componente de shadcn/ui.)

## 3. Configuración en el **otro** proyecto de Supabase

### 3.1 Tabla + RLS (migración)

Ejecuta esto en su proyecto (SQL editor del dashboard, `supabase db query`, o
el MCP `apply_migration`):

```sql
create table if not exists crossword_clues (
  id uuid primary key default gen_random_uuid(),
  mission_id text not null,
  clue_number int not null,
  direction text not null check (direction in ('across', 'down')),
  clue_text text not null,
  answer text not null,
  start_row int not null,
  start_col int not null
);

alter table crossword_clues enable row level security;

create policy "Public read access to crossword_clues"
  on crossword_clues
  for select
  using (true);

grant select on crossword_clues to anon, authenticated;
```

Si en su proyecto ya existe una tabla `crossword_clues` con otro propósito,
renómbrala en este SQL y también en:
- `app/misiones/crucigrama/page.tsx` (`.from('crossword_clues')`)
- `lib/supabase/types.ts` (nombre del tipo `CrosswordClueRow`, si quiere)

La policy es de **lectura pública** a propósito, igual que en memorama: el
juego se consulta desde un server component con la `anon key`, sin sesión de
usuario. Si su tabla va a tener otro tipo de datos sensibles, no reutilicen
esta tabla — creen una nueva.

### 3.2 Seed de datos

```sql
insert into crossword_clues (mission_id, clue_number, direction, clue_text, answer, start_row, start_col) values
  ('mission-4', 1, 'down', 'Personaje principal de la celebración alemana de Pascua.', 'OSTERHASE', 0, 3),
  ('mission-4', 2, 'down', 'Obispo reconocido por su generosidad y celebrado cada diciembre.', 'NIKOLAUS', 3, 7),
  ('mission-4', 3, 'down', 'Publicación que recibíamos al finalizar cada año escolar con fotografías y recuerdos.', 'ANUARIO', 2, 5),
  ('mission-4', 4, 'across', 'Tradicional fiesta de faroles que se celebra en Kinder.', 'LATERNENFEST', 3, 0),
  -- ACEDOSA es intencionalmente "ASODECA" escrito al revés — el propio enunciado
  -- dice "(Invertido)". NO es un typo, no lo "corrijas" a ASODECA.
  ('mission-4', 5, 'across', 'Asociación que reúne hoy a los egresados del Colegio Alemán de Cali. (Invertido)', 'ACEDOSA', 8, 1),
  ('mission-4', 6, 'across', 'Festival folclórico y de la cerveza más grande del mundo.', 'OKTOBERFEST', 0, 3),
  ('mission-4', 7, 'down', 'Instrumento musical que nunca faltaba en el salón de música.', 'PIANO', 1, 1);
```

**Tiene que insertar exactamente el mismo número de filas que espera el
código** (7), o ajustar `EXPECTED_CLUE_COUNT` (ver sección 5). Las coordenadas
(`start_row`/`start_col`) están en un sistema 0-indexado y ya fueron
verificadas letra por letra contra la imagen de referencia original: cada
intersección entre palabras (por ejemplo, `OSTERHASE` y `OKTOBERFEST`
comparten la celda de inicio (0,3); `LATERNENFEST` cruza con `OSTERHASE`,
`ANUARIO`, `NIKOLAUS` y `PIANO`) coincide letra por letra. Si cambia las
respuestas o el layout, `buildGrid()` (`lib/crossword/grid.ts`) lanza un error
en tiempo de ejecución si dos clues que comparten una celda no coinciden en la
letra — úsalo como red de seguridad al editar el seed.

`answer` se guarda en mayúsculas y sin tildes (ver `normalizeAnswer` en
`lib/crossword/validation.ts`) — la validación del juego también normaliza en
tiempo de ejecución (defensa en profundidad), pero mantener el dato ya limpio
en la base evita sorpresas.

### 3.3 Exposición a la API / Data API settings

Igual que en memorama: si en su proyecto la Data API restringe qué tablas son
accesibles, hay que dar acceso explícito a `anon`/`authenticated` sobre
`crossword_clues` además de la RLS (RLS controla filas, no si la tabla es
alcanzable). El `grant select` de la sección 3.1 ya cubre esto, pero
verifiquen en `Project Settings → API → Data API` si su proyecto tiene
restricciones adicionales.

### 3.4 Verificación de seguridad

Después de crear la tabla, correr advisors (`supabase db advisors` o MCP
`get_advisors type=security`) para confirmar que no queda ninguna tabla
expuesta sin RLS.

## 4. Ajustar constantes específicas de esta implementación

| Dónde | Qué | Para qué sirve |
|---|---|---|
| `app/misiones/crucigrama/page.tsx` | `MISSION_ID = 'mission-4'` | filtro `.eq('mission_id', ...)` — cámbialo al identificador que uses en tu propio seed |
| `lib/crossword/clues.ts` | `EXPECTED_CLUE_COUNT = 7` | si insertas más o menos clues, la página muestra el mensaje de error hasta que este número coincida con las filas devueltas |

A diferencia de memorama, **no hay** un límite de tiempo (`TIME_LIMIT_SECONDS`)
ni un tamaño de grid hardcodeado: `rows`/`cols` se derivan automáticamente del
bounding box de las clues en `buildGrid()`, así que un crucigrama con más o
menos palabras, o de otro tamaño, funciona sin tocar código — solo el seed.

## 5. Variables de entorno del **nuevo** proyecto

En el nuevo repo, crear `.env.local` (nunca commitear, agregar `.env*` al
`.gitignore` si no está) apuntando a **su propio** proyecto de Supabase, no al
tuyo:

```
NEXT_PUBLIC_SUPABASE_URL=https://<su-project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<su anon/publishable key>
```

Sacar estos valores de `Project Settings → API` en el dashboard de **su**
proyecto. Usar siempre la **anon/publishable key**, nunca la `service_role` —
`lib/supabase/server.ts` la usa desde un server component, pero como sigue
siendo la clave pública (por eso el prefijo `NEXT_PUBLIC_`), la seguridad real
la da la RLS policy de la sección 3.1, no la clave.

## 6. Qué es específico de Next.js / React (por si su stack es distinto)

- `app/misiones/crucigrama/page.tsx` es un **Server Component** de Next.js
  (App Router) — hace el fetch a Supabase en el servidor antes de renderizar.
  En otro framework, hay que portar esa query a donde corresponda (loader,
  `getServerSideProps`, endpoint API, etc.) y pasarle las `clues` mapeadas al
  componente de juego.
- `CrosswordGame.tsx` es un **Client Component** (`'use client'`) que usa
  `useReducer`/`useEffect`/`useRef` de React para el manejo de teclado y foco
  — toda la lógica del reducer, la construcción de la grilla y la validación
  (`reducer.ts`, `grid.ts`, `validation.ts`, `clues.ts`) es JS/TS puro, sin
  dependencias de React, así que se puede reusar en cualquier framework de UI.
- `CrosswordCell.tsx`, `CrosswordGrid.tsx`, `ClueList.tsx`,
  `ProgressReadout.tsx` son componentes presentacionales sin lógica de negocio
  propia — en otro framework, son el patrón a replicar (una celda por
  `<input>`, una lista de clues clickeable, un contador de progreso), no algo
  que dependa de shadcn/ui ni de ninguna librería de UI concreta.

## 7. Checklist final antes de dar por listo

- [ ] Tabla `crossword_clues` creada con RLS + policy de lectura pública en su proyecto.
- [ ] Seed insertado, con el mismo `mission_id` que usa el código y las 7 filas (coordenadas verificadas, incluyendo `ACEDOSA` sin "corregir").
- [ ] `EXPECTED_CLUE_COUNT` y `MISSION_ID` ajustados si cambió la cantidad de clues.
- [ ] `.env.local` con la URL y anon key **de su propio proyecto**, no commiteado.
- [ ] `npm run dev` y abrir `/misiones/crucigrama` — la grilla carga sin errores en consola.
- [ ] Click, tipeo, backspace y flechas de navegación funcionan; completar las 7 palabras muestra el estado de victoria.
- [ ] Sin errores de hydration mismatch (si aparecen, revisar que el `useEffect` de foco en `CrosswordGame.tsx` no se haya movido a ejecutar durante el render).
- [ ] `supabase db advisors` (o MCP `get_advisors`) sin hallazgos de seguridad nuevos.
