import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MissionShell } from './MissionShell';

describe('MissionShell', () => {
  it('renders the breadcrumb, title, description and back link', () => {
    render(
      <MissionShell
        missionNumber={6}
        missionName="Galgenmännchen"
        title="Juego del ahorcado"
        description="Adivina la palabra en alemán."
        backHref="/"
      >
        <p>contenido del juego</p>
      </MissionShell>
    );

    expect(screen.getByText('Misión 6')).toBeInTheDocument();
    expect(screen.getByText('Galgenmännchen')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Juego del ahorcado' })).toBeInTheDocument();
    expect(screen.getByText('Adivina la palabra en alemán.')).toBeInTheDocument();
    expect(screen.getByText('contenido del juego')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /salir de la misión/i })).toHaveAttribute('href', '/');
  });

  it('renders footer actions passed as footerActions', () => {
    render(
      <MissionShell
        missionNumber={3}
        missionName="Parejas ocultas"
        title="Memorama"
        description="Encuentra las parejas."
        backHref="/"
        footerActions={<button>Reiniciar</button>}
      >
        <p>tablero</p>
      </MissionShell>
    );

    expect(screen.getByRole('button', { name: 'Reiniciar' })).toBeInTheDocument();
  });
});
