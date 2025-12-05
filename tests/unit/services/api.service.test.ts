import { describe, expect, it, vi } from 'vitest';
import { apiService } from '@/services/api.service';
import axios from 'axios';

vi.mock('axios', () => {
  const requestHandlers: Array<(config: any) => any> = [];
  const responseHandlers: Array<{
    onFulfilled?: (value: any) => any;
    onRejected?: (error: any) => any;
  }> = [];

  const mockInstance = {
    interceptors: {
      request: {
        use: (onFulfilled: (config: any) => any) => {
          requestHandlers.push(onFulfilled);
        },
      },
      response: {
        use: (onFulfilled: (value: any) => any, onRejected: (error: any) => any) => {
          responseHandlers.push({ onFulfilled, onRejected });
        },
      },
    },
    post: vi.fn(),
    get: vi.fn(),
    delete: vi.fn(),
  };

  class AxiosError extends Error {
    response?: any;
    constructor(message: string, response?: any) {
      super(message);
      this.response = response;
    }
  }

  const axiosMock = {
    create: vi.fn(() => mockInstance),
    __mock: {
      requestHandlers,
      responseHandlers,
      instance: mockInstance,
    },
  };

  return {
    default: axiosMock,
    AxiosError,
  };
});

describe('api.service', () => {
  it('attaches Authorization header when token is present', () => {
    apiService.setAccessToken('token-123');

    const requestHandler = (axios as any).__mock.requestHandlers[0];
    const config = { headers: {} };
    const updatedConfig = requestHandler(config);

    expect(updatedConfig.headers.Authorization).toBe('Bearer token-123');
  });

  it('dispatches auth:unauthorized on 401 responses', async () => {
    const dispatchSpy = vi.spyOn(window, 'dispatchEvent');
    const responseInterceptor = (axios as any).__mock.responseHandlers[0];

    expect(responseInterceptor?.onRejected).toBeDefined();

    const error = { response: { status: 401 }, message: 'Unauthorized' };
    await expect(responseInterceptor!.onRejected!(error)).rejects.toBe(error);
    expect(dispatchSpy).toHaveBeenCalledWith(expect.objectContaining({ type: 'auth:unauthorized' }));
  });
});
