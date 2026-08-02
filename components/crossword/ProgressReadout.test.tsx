import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProgressReadout } from './ProgressReadout';

describe('ProgressReadout', () => {
  it('renders the exact progress string at the start', () => {
    render(<ProgressReadout solvedCount={0} totalCount={7} />);
    expect(screen.getByText('Has encontrado 0 de 7 palabras')).toBeInTheDocument();
  });

  it('renders the exact progress string when complete', () => {
    render(<ProgressReadout solvedCount={7} totalCount={7} />);
    expect(screen.getByText('Has encontrado 7 de 7 palabras')).toBeInTheDocument();
  });
});
