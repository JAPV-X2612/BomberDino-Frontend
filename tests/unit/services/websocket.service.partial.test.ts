import { describe, expect, it, vi, beforeEach } from 'vitest';
import { webSocketService } from '@/services/websocket.service';

const createdClients: any[] = [];

vi.mock('@stomp/stompjs', () => {
  class Client {
    public connected = false;
    public opts: any;
    constructor(opts: any) {
      this.opts = opts;
      createdClients.push(this);
    }
    activate() {
      this.opts.onStompError?.({ headers: { message: 'fail' }, body: 'x' });
    }
    deactivate() {
      this.connected = false;
    }
    subscribe() {
      return { unsubscribe: vi.fn() };
    }
    publish() {}
  }
  return { Client };
});

vi.mock('sockjs-client', () => ({
  default: vi.fn(() => ({})),
}));

describe('websocket.service error paths', () => {
  beforeEach(() => {
    createdClients.length = 0;
  });

  it('handles stomp error during connect', async () => {
    await expect(webSocketService.connect()).rejects.toThrow();
    expect(createdClients).toHaveLength(1);
  });
});
