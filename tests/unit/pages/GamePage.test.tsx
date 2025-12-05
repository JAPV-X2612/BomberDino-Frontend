import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { GamePage } from '@/pages/Game/GamePage';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('@/context/GameContext', () => ({
  useGame: () => ({
    gameState: null,
    sessionId: null,
    playerId: null,
    isConnected: false,
  }),
}));

describe('GamePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading state when session data is missing', () => {
    render(
      <MemoryRouter>
        <GamePage />
      </MemoryRouter>,
    );

    expect(screen.getByText(/cargando/i)).toBeInTheDocument();
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });
});
