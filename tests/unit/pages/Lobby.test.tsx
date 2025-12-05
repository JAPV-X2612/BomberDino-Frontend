import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Lobby } from '@/pages/Lobby/Lobby';
import { GameStatus, PlayerStatus } from '@/types/api-types';

const mockNavigate = vi.fn();
const mockOnGameStartCallbacks: Array<() => void> = [];
const mockStartGame = vi.fn().mockResolvedValue(undefined);
const mockUseGameReturn = {
  gameState: {
    sessionId: 'session-1',
    status: GameStatus.WAITING,
    tiles: [],
    bombs: [],
    explosions: [],
    powerUps: [],
    serverTime: 0,
    players: [
      {
        id: 'p1',
        username: 'Alice',
        posX: 0,
        posY: 0,
        lifeCount: 3,
        status: PlayerStatus.ALIVE,
        kills: 0,
        deaths: 0,
        hasShield: false,
        bombCount: 1,
        bombRange: 1,
        speed: 1,
      },
      {
        id: 'p2',
        username: 'Bob',
        posX: 0,
        posY: 0,
        lifeCount: 3,
        status: PlayerStatus.ALIVE,
        kills: 0,
        deaths: 0,
        hasShield: false,
        bombCount: 1,
        bombRange: 1,
        speed: 1,
      },
    ],
  },
  sessionId: 'session-1',
  playerId: 'p1',
  startGame: mockStartGame,
  onGameStart: (cb: () => void) => {
    mockOnGameStartCallbacks.push(cb);
    return () => {};
  },
};

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useSearchParams: () => [new URLSearchParams('roomId=ROOM01'), vi.fn()],
  };
});

vi.mock('@/context/GameContext', () => ({
  useGame: () => mockUseGameReturn,
}));

describe('Lobby page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockOnGameStartCallbacks.length = 0;
  });

  it('renders players and enables start button with enough players', () => {
    render(
      <MemoryRouter>
        <Lobby />
      </MemoryRouter>,
    );

    expect(screen.getByText(/alice/i)).toBeInTheDocument();
    expect(screen.getByText(/bob/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /iniciar juego/i })).toBeEnabled();
  });

  it('navigates to game when onGameStart callback triggers', () => {
    render(
      <MemoryRouter>
        <Lobby />
      </MemoryRouter>,
    );

    expect(mockOnGameStartCallbacks).toHaveLength(1);
    mockOnGameStartCallbacks[0]();

    expect(mockNavigate).toHaveBeenCalledWith('/game');
  });

  it('calls startGame when start button is clicked', async () => {
    render(
      <MemoryRouter>
        <Lobby />
      </MemoryRouter>,
    );

    const startButton = screen.getByRole('button', { name: /iniciar juego/i });
    fireEvent.click(startButton);

    expect(mockStartGame).toHaveBeenCalled();
  });
});
