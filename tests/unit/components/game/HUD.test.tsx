import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Hud } from '@/components/game/GameUI/HUD/HUD';
import { DinoColor } from '@/types/game-types';

describe('Hud component', () => {
  it('renders players with hearts based on remaining lives and shows dead indicator', () => {
    const players = [
      {
        id: 'p1',
        name: 'Alice',
        color: DinoColor.BLUE,
        position: { x: 0, y: 0 },
        lives: 3,
        deaths: 1,
        speed: 1,
        bombRange: 1,
        maxBombs: 1,
        isAlive: true,
      },
      {
        id: 'p2',
        name: 'Bob',
        color: DinoColor.GREEN,
        position: { x: 0, y: 0 },
        lives: 0,
        deaths: 3,
        speed: 1,
        bombRange: 1,
        maxBombs: 1,
        isAlive: false,
      },
    ];

    const { container } = render(<Hud players={players} timeRemaining={90} />);

    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
    expect(screen.getByText(/Time Remaining: 90s/i)).toBeInTheDocument();

    // Alice: maxLives 3 - deaths 1 => 2 hearts
    expect(container.querySelectorAll('.heart').length).toBe(2);
    // Bob: no hearts remaining, shows dead indicator
    expect(container.querySelector('.dead-indicator')).toBeInTheDocument();
  });
});
