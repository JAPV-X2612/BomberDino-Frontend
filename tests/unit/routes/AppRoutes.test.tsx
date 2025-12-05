import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AppRoutes } from '@/routes/AppRoutes';

vi.mock('@pages/Home/Home', () => ({
  Home: () => <div>HomeMock</div>,
}));

vi.mock('@pages/Lobby/Lobby', () => ({
  Lobby: () => <div>LobbyMock</div>,
}));

vi.mock('@pages/Game/GamePage', () => ({
  GamePage: () => <div>GameMock</div>,
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    BrowserRouter: ({ children }: { children: React.ReactNode }) => (
      <actual.MemoryRouter initialEntries={['/lobby']}>{children}</actual.MemoryRouter>
    ),
  };
});

describe('AppRoutes', () => {
  it('renders Lobby route using BrowserRouter mocked with MemoryRouter', () => {
    render(<AppRoutes />);
    expect(screen.getByText('LobbyMock')).toBeInTheDocument();
  });
});
