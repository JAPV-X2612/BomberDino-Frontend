import { describe, expect, it, vi, beforeEach } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Home } from '@/pages/Home/Home';

const mockNavigate = vi.fn();
const mockUseAuth = vi.fn();
const mockUseGame = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('@/context/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));

vi.mock('@/context/GameContext', () => ({
  useGame: () => mockUseGame(),
}));

describe('Home page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading state when auth is loading', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: true,
      user: null,
      login: vi.fn(),
      logout: vi.fn(),
      loginError: null,
      clearLoginError: vi.fn(),
      accessToken: null,
      getAccessToken: vi.fn(),
    });
    mockUseGame.mockReturnValue({
      createRoom: vi.fn(),
      joinRoom: vi.fn(),
    });

    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>,
    );

    expect(screen.getByText(/cargando/i)).toBeInTheDocument();
  });

  it('calls login when the Microsoft button is clicked', async () => {
    const loginMock = vi.fn().mockResolvedValue(undefined);
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      user: null,
      login: loginMock,
      logout: vi.fn(),
      loginError: null,
      clearLoginError: vi.fn(),
      accessToken: null,
      getAccessToken: vi.fn(),
    });
    mockUseGame.mockReturnValue({
      createRoom: vi.fn(),
      joinRoom: vi.fn(),
    });

    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole('button', { name: /continuar con microsoft/i }));
    await waitFor(() => expect(loginMock).toHaveBeenCalled());
  });

  it('shows room options after continuing when authenticated', async () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { name: 'Tester' },
      login: vi.fn(),
      logout: vi.fn(),
      loginError: null,
      clearLoginError: vi.fn(),
      accessToken: 'token',
      getAccessToken: vi.fn(),
    });
    mockUseGame.mockReturnValue({
      createRoom: vi.fn(),
      joinRoom: vi.fn(),
    });

    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole('button', { name: /^continuar$/i }));

    expect(await screen.findByText(/crear sala/i)).toBeInTheDocument();
    expect(screen.getByText(/entrar a sala/i)).toBeInTheDocument();
  });

  it('shows validation error when trying to join without code', async () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { name: 'Tester' },
      login: vi.fn(),
      logout: vi.fn(),
      loginError: null,
      clearLoginError: vi.fn(),
      accessToken: 'token',
      getAccessToken: vi.fn(),
    });
    mockUseGame.mockReturnValue({
      createRoom: vi.fn(),
      joinRoom: vi.fn(),
    });

    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole('button', { name: /^continuar$/i }));
    fireEvent.click(await screen.findByRole('button', { name: /entrar a sala/i }));

    expect(screen.getByText(/ingresa un c/i)).toBeInTheDocument();
  });
});
