# Ahorcado (Misión 6 — Galgenmännchen) — Diseño

## Contexto

Sexta misión del sitio Einheit 2026: un ahorcado donde el jugador adivina, letra por
letra, palabras en alemán (UI en español). A diferencia de memorama/crucigrama, la figura
del ahorcado es el conejo mascota del sitio: cada letra incorrecta agrega una pieza del
conejo sobre la horca; si se completan las 7 piezas ("se arma el conejo"), se pierde la
partida.

Esta sesión también introduce, por primera vez en el repo, el "chrome" visual compartido
entre misiones (header con logo ASODECA/EINIGKEIT 2026 + "Mi cuenta", breadcrumb de
misión, footer con "Salir de la misión"/acción de misión) que se ve en la guía visual
(`mission6-temp/hangman-*.jpeg`). Memorama y crucigrama hoy son un `<main>` suelto sin ese
marco; esta sesión lo construye y retrofitea las tres misiones existentes+nueva a usarlo.

Registro/login real y tracking de puntaje hacia el sistema de puntos del README quedan
fuera de alcance, igual que en memorama y crucigrama.

## Stack

- **Next.js 15 (App Router) + TypeScript**
- **Tailwind CSS + shadcn/ui** (Dialog, Button — reutilizados de memorama)
- **Supabase** (Postgres) como backend, solo lectura pública (sin auth todavía)
- **Vitest + React Testing Library** para la lógica del juego y componentes
- **sharp** (nueva devDependency, uso puntual en script) para procesar los assets del
  conejo

## Arquitectura

- `app/misiones/layout.tsx` — **Server Component** nuevo, envuelve `/misiones/*`. Contiene
  solo el chrome 100% estático: header (logo + "Mi cuenta") y el contenedor de página.
  Memorama y crucigrama pasan a vivir bajo este layout (sin chrome propio, no tenían
  ninguno).
- `components/misiones/MissionShell.tsx` — componente **cliente** reutilizable que cada
  página de misión instancia con sus propios datos (Next.js no permite que una página le
  pase props a su layout padre). Provee: breadcrumb ("Misión N · nombre"), bloque de
  título/descripción, y una barra inferior fija con "Salir de la misión" (link a `/`) +
  un slot de children para la acción propia de cada misión (en ahorcado: "Reiniciar").
- `app/misiones/ahorcado/page.tsx` — Server Component, mismo patrón que memorama: hace
  `await supabase.from('hangman_words').select(...)`, valida que haya filas, mapea a
  dominio y pasa el array de palabras a `HangmanGame` (Client Component). La selección de
  la palabra a jugar ocurre en cliente, no en el servidor.
- `components/hangman/HangmanGame.tsx` — Client Component, orquesta el estado del juego
  vía `useReducer` y renderiza `MissionShell`, `WordDisplay`, `LetterGrid`, `Rabbit` y el
  modal de resultado.

## Modelo de datos (Supabase)

Tabla `hangman_words`:

| campo | tipo | descripción |
|---|---|---|
| `id` | uuid (PK) | |
| `mission_id` | text | referencia a la misión (`"mission-6"`) |
| `word` | text | palabra en alemán, solo A-Z (sin ß/Ä/Ö/Ü), en mayúsculas |
| `order_index` | int | orden opcional, para consistencia de despliegue |

RLS habilitado con policy de `select` pública (`using (true)`), más
`grant select on hangman_words to anon, authenticated;` — mismo patrón que `memory_pairs`.

Seed con ~12-15 palabras temáticas del evento (ej. FREUNDSCHAFT, ERINNERUNG, GENERATION,
SCHULE, LEHRER, HEIMAT, ZUSAMMENHALT, WIEDERSEHEN, MAUER, EINHEIT, ZUKUNFT,
VERGANGENHEIT), ajustable durante implementación.

No hay tracking de progreso de usuario en esta fase (no hay auth aún), igual que en las
misiones anteriores.

## Assets del conejo

`assets/*.jpg` (head, tshirt, trousers, leftear, rightear, lefthand, righthand) tienen
fondo blanco sólido, sin canal alfa. Se agrega un script puntual
(`scripts/process-hangman-assets.ts`, no forma parte del runtime) que usa `sharp` para
convertir el blanco casi puro a transparente, escribiendo PNGs en
`public/misiones/ahorcado/`. Esos PNG (no los JPG originales) son los que consume
`Rabbit.tsx`. No se usa Supabase Storage para este arte fijo del personaje — es distinto
de las imágenes por fila de memorama.

## Lógica del juego (`lib/game/hangman.ts`)

Framework-free, con tests — mismo espíritu que `lib/game/reducer.ts` de memorama.

**Constantes:**
- `MAX_WRONG_GUESSES = 7`
- `RABBIT_PARTS`: orden fijo de 7 partes — `head, torso, leftArm, rightArm, legs, leftEar,
  rightEar` (según guía visual "Partes del conejo").

**Estado (`GameState`):**
- `word`: palabra actual en mayúsculas.
- `guessedLetters`: letras correctas seleccionadas.
- `wrongLetters`: letras incorrectas seleccionadas (su longitud determina cuántas piezas
  del conejo se muestran).
- `status`: `'playing' | 'won' | 'lost'`.

**Flujo (reducer puro):**
1. `GUESS_LETTER`: si `status !== 'playing'` o la letra ya fue usada (en `guessedLetters` o
   `wrongLetters`), no hace nada. Si la letra está en `word` → se agrega a
   `guessedLetters`; si todas las letras únicas de `word` quedan cubiertas → `status =
   'won'`. Si no está → se agrega a `wrongLetters`; si `wrongLetters.length ===
   MAX_WRONG_GUESSES` → `status = 'lost'` (conejo armado completo).
2. `RESET`: recibe una nueva `word` y reinicia `guessedLetters`/`wrongLetters`/`status`.

**Selección de palabra:** `pickRandomWord(words: string[]): string`, usada solo dentro de
un `useEffect([])` en `HangmanGame` (nunca en el render inicial ni en el servidor) — mismo
patrón de hidratación que `buildDeck` en memorama. El `useReducer` se inicializa de forma
perezosa con la **primera** palabra del array (determinista) para que el HTML de servidor
y el primer render de cliente coincidan; el `useEffect` post-montaje dispara `RESET` con
`pickRandomWord(words)` para sortear la palabra real de la partida.

**Modal de resultado:** reutiliza/adapta el patrón de `components/memory/ResultModal.tsx`
(shadcn `Dialog`) — mensaje temático con el conejo, botón "Reintentar" (dispatch `RESET`
con nueva palabra aleatoria) y cierre.

**Manejo de errores:** si el fetch a Supabase falla o no devuelve palabras, se muestra un
estado de error simple en la página en vez del tablero.

## Componentes

- `HangmanGame` — orquestador de estado (client)
- `WordDisplay` — presentacional, guiones por letra, revela las adivinadas
- `LetterGrid` — grilla A-Z (26 botones), estado neutro/verde/rojo, deshabilita usadas
- `Rabbit` — horca + piezas del conejo superpuestas según `wrongLetters.length`
- `MissionShell` — chrome reutilizable (breadcrumb, título, footer con slot de acción)

## Estilos

Fondo cálido/crema como en la guía visual, tarjetas de letra con borde azul oscuro,
verde para acierto y rojo para error (igual paleta que el resto del sitio). El conejo y
la horca se posicionan con CSS absoluto sobre un contenedor de tamaño fijo; las piezas se
superponen en el orden de `RABBIT_PARTS` respetando el encaje descrito en la guía ("evitar
que se muestren zonas muertas"). Responsivo: el teclado A-Z se reordena a menos columnas
en mobile.

## Testing

Vitest + React Testing Library:
- `lib/game/hangman.test.ts`: letra correcta revela ocurrencias múltiples; letra
  incorrecta agrega pieza; victoria al completar la palabra; derrota a las 7 letras
  incorrectas; `RESET` reinicia con nueva palabra; letras repetidas no se reprocesan;
  normalización a mayúsculas.
- `components/hangman/LetterGrid.test.tsx`: deshabilita letras usadas, refleja
  correcto/incorrecto.
- `components/hangman/WordDisplay.test.tsx`: revela solo letras adivinadas.
- `components/hangman/Rabbit.test.tsx`: muestra el número de piezas correcto según
  `wrongLetters.length`.
- `components/misiones/MissionShell.test.tsx`: breadcrumb/título con las props dadas; el
  slot de acciones renderiza los children pasados.

Sin tests end-to-end en esta fase.

## Fuera de alcance (próximas sesiones)

- Sistema de cuentas real detrás de "Mi cuenta" (sigue como UI estática).
- Pistas/categorías por palabra (solo se guarda `word` por ahora).
- Tracking de puntaje/ranking hacia el sistema de puntos del README.
- Registro e inicio de sesión.
