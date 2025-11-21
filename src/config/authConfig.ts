import { type Configuration, BrowserCacheLocation } from '@azure/msal-browser';

const clientId = import.meta.env.VITE_AZURE_CLIENT_ID;
const tenantId = import.meta.env.VITE_AZURE_TENANT_ID;

if (!clientId) {
    console.error('VITE_AZURE_CLIENT_ID is not defined in environment variables');
}

if (!tenantId) {
    console.error('VITE_AZURE_TENANT_ID is not defined in environment variables');
}

/**
 * MSAL configuration for Microsoft Entra ID authentication.
 */
export const msalConfig: Configuration = {
    auth: {
        clientId: clientId || '',
        authority: `https://login.microsoftonline.com/${tenantId || 'common'}`,
        redirectUri: window.location.origin,
        postLogoutRedirectUri: window.location.origin,
        navigateToLoginRequestUrl: true,
    },
    cache: {
        cacheLocation: BrowserCacheLocation.SessionStorage,
        storeAuthStateInCookie: true,
    },
};

/**
 * Scopes for login request.
 */
export const loginRequest = {
    scopes: ['openid', 'profile', 'email', 'User.Read'],
};