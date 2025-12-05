import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '@/App';

vi.mock('@/context/AuthContext', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="auth-provider">{children}</div>
  ),
}));

vi.mock('@/context/GameContext', () => ({
  GameProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="game-provider">{children}</div>
  ),
}));

vi.mock('@/routes/AppRoutes', () => ({
  AppRoutes: () => <div data-testid="app-routes">Routes content</div>,
}));

describe('App', () => {
  it('wraps AppRoutes with AuthProvider and GameProvider', () => {
    render(<App />);

    expect(screen.getByTestId('auth-provider')).toBeInTheDocument();
    expect(screen.getByTestId('game-provider')).toBeInTheDocument();
    expect(screen.getByTestId('app-routes')).toBeInTheDocument();
  });
});
