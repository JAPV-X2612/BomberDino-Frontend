import { describe, expect, it, vi, beforeEach } from 'vitest';
import { apiService, apiClient } from '@/services/api.service';

describe('api.service integration (axios adapter stub)', () => {
  beforeEach(() => {
    apiService.setAccessToken(null);
  });

  it('attaches Authorization header when token is set and dispatches auth:unauthorized on 401', async () => {
    const dispatchSpy = vi.spyOn(window, 'dispatchEvent');

    apiService.setAccessToken('token-abc');

    apiClient.defaults.adapter = (config) => {
      // Simulate 401 to trigger response interceptor
      return Promise.reject({
        response: { status: 401, data: {} },
        config,
        message: 'Unauthorized',
      });
    };

    await expect(apiClient.get('/test')).rejects.toBeDefined();
    expect(dispatchSpy).toHaveBeenCalledWith(expect.objectContaining({ type: 'auth:unauthorized' }));
  });

  it('sends request with bearer token header through adapter', async () => {
    apiService.setAccessToken('token-xyz');

    apiClient.defaults.adapter = async (config) => {
      return {
        data: { ok: true },
        status: 200,
        statusText: 'OK',
        headers: config.headers || {},
        config,
      };
    };

    const res = await apiClient.get('/ping');
    expect(res.config.headers?.Authorization).toBe('Bearer token-xyz');
    expect(res.data).toEqual({ ok: true });
  });
});
