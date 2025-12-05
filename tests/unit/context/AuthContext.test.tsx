import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '@/context/AuthContext';

const mockState = {
  handleRedirectResult: null as any,
  accounts: [] as any[],
  loginPopupResult: null as any,
  acquireSilentResult: { accessToken: 'token-silent' },
  acquirePopupResult: { accessToken: 'token-popup' },
  logoutResult: undefined as any,
};

vi.mock('@azure/msal-browser', () => {
  const BrowserCacheLocation = { LocalStorage: 'localStorage' };
  class PublicClientApplication {
    initialize = vi.fn().mockResolvedValue(undefined);
    handleRedirectPromise = vi.fn(async () => mockState.handleRedirectResult);
    getAllAccounts = vi.fn(() => mockState.accounts);
    loginPopup = vi.fn(async () => mockState.loginPopupResult);
    acquireTokenSilent = vi.fn(async () => mockState.acquireSilentResult);
    acquireTokenPopup = vi.fn(async () => mockState.acquirePopupResult);
    logoutPopup = vi.fn(async () => mockState.logoutResult);
    setActiveAccount = vi.fn();
  }
  class InteractionRequiredAuthError extends Error {}
  return { PublicClientApplication, InteractionRequiredAuthError, BrowserCacheLocation };
});

const AuthConsumer = () => {
  const auth = useAuth();
  return (
    <div>
      <div data-testid="auth-state">
        {auth.isAuthenticated ? 'auth' : 'anon'}-{auth.isLoading ? 'loading' : 'ready'}
      </div>
      <div data-testid="token">{auth.accessToken || 'no-token'}</div>
      <div data-testid="login-error">{auth.loginError || 'no-error'}</div>
      <button onClick={() => auth.login()}>login</button>
    </div>
  );
};

const renderAuth = () =>
  render(
    <AuthProvider>
      <AuthConsumer />
    </AuthProvider>,
  );

describe('AuthContext', () => {
  beforeEach(() => {
    mockState.handleRedirectResult = null;
    mockState.accounts = [];
    mockState.loginPopupResult = { account: { username: 'user@mail.escuelaing.edu.co' } };
    mockState.acquireSilentResult = { accessToken: 'token-silent' };
    mockState.acquirePopupResult = { accessToken: 'token-popup' };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('initializes and stays anonymous when there is no account', async () => {
    renderAuth();

    await waitFor(() =>
      expect(screen.getByTestId('auth-state').textContent).toBe('anon-ready'),
    );
    expect(screen.getByTestId('token').textContent).toBe('no-token');
  });

  it('sets authenticated state when redirect result contains allowed account', async () => {
    mockState.handleRedirectResult = {
      account: { username: 'player@mail.escuelaing.edu.co' },
    };

    renderAuth();

    await waitFor(() =>
      expect(screen.getByTestId('auth-state').textContent).toBe('auth-ready'),
    );
    expect(screen.getByTestId('token').textContent).toBe('token-silent');
  });

  it('shows loginError when login uses disallowed domain', async () => {
    mockState.loginPopupResult = { account: { username: 'user@forbidden.com' } };

    renderAuth();
    const btn = screen.getByText('login');
    await act(async () => {
      btn.click();
    });

    await waitFor(() =>
      expect(screen.getByTestId('login-error').textContent).toMatch(/Acceso restringido/i),
    );
    expect(screen.getByTestId('auth-state').textContent).toBe('anon-ready');
  });
});
