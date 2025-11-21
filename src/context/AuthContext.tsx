import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
    PublicClientApplication,
    type AccountInfo,
    InteractionRequiredAuthError,
} from '@azure/msal-browser';
import { msalConfig, loginRequest } from '@/config/authConfig';

interface AuthContextValue {
    isAuthenticated: boolean;
    isLoading: boolean;
    user: AccountInfo | null;
    accessToken: string | null;
    login: () => Promise<void>;
    logout: () => Promise<void>;
    getAccessToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const msalInstance = new PublicClientApplication(msalConfig);

/**
 * Hook to access authentication context.
 * @returns AuthContextValue
 * @throws Error if used outside AuthProvider
 */
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
 */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState<AccountInfo | null>(null);
    const [accessToken, setAccessToken] = useState<string | null>(null);

    useEffect(() => {
        const initializeAuth = async () => {
            try {
                await msalInstance.initialize();

                const response = await msalInstance.handleRedirectPromise();
                if (response) {
                    setUser(response.account);
                    setAccessToken(response.accessToken);
                    setIsAuthenticated(true);
                } else {
                    const accounts = msalInstance.getAllAccounts();
                    if (accounts.length > 0) {
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
            const response = await msalInstance.loginPopup(loginRequest);
            setUser(response.account);
            setAccessToken(response.accessToken);
            setIsAuthenticated(true);
        } catch (error) {
            console.error('Login error:', error);
            throw error;
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
        } catch (error) {
            console.error('Logout error:', error);
        }
    }, []);

    const getAccessToken = useCallback(async (): Promise<string | null> => {
        if (!user) return null;

        try {
            const response = await msalInstance.acquireTokenSilent({
                ...loginRequest,
                account: user,
            });
            setAccessToken(response.accessToken);
            return response.accessToken;
        } catch (error) {
            if (error instanceof InteractionRequiredAuthError) {
                try {
                    const response = await msalInstance.acquireTokenPopup(loginRequest);
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
        login,
        logout,
        getAccessToken,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
