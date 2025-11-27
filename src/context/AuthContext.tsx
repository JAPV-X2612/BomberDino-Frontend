import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
    PublicClientApplication,
    type AccountInfo,
    InteractionRequiredAuthError,
} from '@azure/msal-browser';
import { msalConfig, loginRequest, apiRequest } from '@/config/authConfig';

interface AuthContextValue {
    isAuthenticated: boolean;
    isLoading: boolean;
    user: AccountInfo | null;
    accessToken: string | null;
    loginError: string | null;
    clearLoginError: () => void;
    login: () => Promise<void>;
    logout: () => Promise<void>;
    getAccessToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const msalInstance = new PublicClientApplication(msalConfig);

const ALLOWED_DOMAINS = ['mail.escuelaing.edu.co', 'escuelaing.edu.co', 'hotmail.com', 'outlook.com'];

/**
 * Validates if email belongs to allowed domains.
 * @param email user email address
 * @returns true if domain is allowed
 */
const isAllowedDomain = (email: string): boolean => {
    const lowerEmail = email.toLowerCase();
    return ALLOWED_DOMAINS.some(domain => lowerEmail.endsWith(`@${domain}`));
};

/**
 * Silently clears MSAL session without popup.
 */
const forceLogoutInvalidAccount = async (): Promise<void> => {
    try {
        await msalInstance.logoutPopup({
            postLogoutRedirectUri: window.location.origin,
            mainWindowRedirectUri: window.location.origin,
        });
    } catch (error) {
        console.warn('Logout popup error:', error);
        Object.keys(sessionStorage).forEach(key => {
            if (key.startsWith('msal.')) {
                sessionStorage.removeItem(key);
            }
        });
    }
};

/**
 * Hook to access authentication context.
 * @returns AuthContextValue
 * @throws Error if used outside AuthProvider
 */
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = (): AuthContextValue => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

/**
 * Authentication provider component.
 * Manages Microsoft Entra ID authentication state.
 * Restricts access to @mail.escuelaing.edu.co, @escuelaing.edu.co, @hotmail.com and @outlook.com domains.
 */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState<AccountInfo | null>(null);
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [loginError, setLoginError] = useState<string | null>(null);

    const clearLoginError = useCallback(() => {
        setLoginError(null);
    }, []);

    useEffect(() => {
        const initializeAuth = async () => {
            try {
                await msalInstance.initialize();

                const response = await msalInstance.handleRedirectPromise();
                if (response) {
                    const email = response.account?.username || '';
                    if (!isAllowedDomain(email)) {
                        setLoginError('Acceso restringido.\nSolo se permiten cuentas @escuelaing.edu.co, @mail.escuelaing.edu.co, @hotmail.com y @outlook.com');
                        await forceLogoutInvalidAccount();
                        return;
                    }

                    setUser(response.account);
                    setAccessToken(response.accessToken);
                    setIsAuthenticated(true);
                } else {
                    const accounts = msalInstance.getAllAccounts();
                    if (accounts.length > 0) {
                        const email = accounts[0].username || '';
                        if (!isAllowedDomain(email)) {
                           setLoginError('Acceso restringido.\nSolo se permiten cuentas @escuelaing.edu.co, @mail.escuelaing.edu.co, @hotmail.com y @outlook.com');
                            await forceLogoutInvalidAccount();
                            return;
                        }

                        setUser(accounts[0]);
                        setIsAuthenticated(true);

                        try {
                            const tokenResponse = await msalInstance.acquireTokenSilent({
                                ...loginRequest,
                                account: accounts[0],
                            });
                            setAccessToken(tokenResponse.accessToken);
                        } catch (error) {
                            console.warn('Silent token acquisition failed:', error);
                        }
                    }
                }
            } catch (error) {
                console.error('Auth initialization error:', error);
            } finally {
                setIsLoading(false);
            }
        };

        initializeAuth();
    }, []);

    const login = useCallback(async () => {
        try {
            setIsLoading(true);
            setLoginError(null);

            const loginResponse = await msalInstance.loginPopup(loginRequest);

            const email = loginResponse.account?.username || '';
            if (!isAllowedDomain(email)) {
               setLoginError('Acceso restringido.\nSolo se permiten cuentas @escuelaing.edu.co, @mail.escuelaing.edu.co, @hotmail.com y @outlook.com');
                setIsLoading(false);
                await forceLogoutInvalidAccount();
                return;
            }

            let tokenResponse;
            try {
                tokenResponse = await msalInstance.acquireTokenSilent({
                    ...apiRequest,
                    account: loginResponse.account,
                });
            } catch (silentError) {
                console.warn('Silent token failed, trying popup:', silentError);
                tokenResponse = await msalInstance.acquireTokenPopup({
                    ...apiRequest,
                    account: loginResponse.account,
                });
            }

            // console.log('API Token scopes:', tokenResponse.scopes);
            // console.log('API Token audience (decode in jwt.io):', tokenResponse.accessToken.substring(0, 50));

            setUser(loginResponse.account);
            setAccessToken(tokenResponse.accessToken);
            setIsAuthenticated(true);
        } catch (error) {
            console.error('Login error:', error);
            setLoginError('Error al iniciar sesión.\nIntenta de nuevo.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    const logout = useCallback(async () => {
        try {
            await msalInstance.logoutPopup({
                postLogoutRedirectUri: window.location.origin,
            });
            setUser(null);
            setAccessToken(null);
            setIsAuthenticated(false);
            setLoginError(null);
        } catch (error) {
            console.error('Logout error:', error);
        }
    }, []);

    const getAccessToken = useCallback(async (): Promise<string | null> => {
        if (!user) return null;

        try {
            const response = await msalInstance.acquireTokenSilent({
                ...apiRequest,
                account: user,
            });
            setAccessToken(response.accessToken);
            return response.accessToken;
        } catch (error) {
            if (error instanceof InteractionRequiredAuthError) {
                try {
                    const response = await msalInstance.acquireTokenPopup(apiRequest);
                    setAccessToken(response.accessToken);
                    return response.accessToken;
                } catch (popupError) {
                    console.error('Token popup error:', popupError);
                    return null;
                }
            }
            console.error('Token acquisition error:', error);
            return null;
        }
    }, [user]);

    const value: AuthContextValue = {
        isAuthenticated,
        isLoading,
        user,
        accessToken,
        loginError,
        clearLoginError,
        login,
        logout,
        getAccessToken,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
