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
      this.connected = true;
      this.opts?.onConnect?.({});
    }
    deactivate() {
      this.connected = false;
    }
    subscribe(destination: string, cb: (message: any) => void) {
      this.lastSubscription = { destination, cb };
      return { unsubscribe: vi.fn() };
    }
    publish(payload: any) {
      this.lastPublish = payload;
    }
  }
  return { Client };
});

vi.mock('sockjs-client', () => ({
  default: vi.fn(() => ({})),
}));

describe('websocket.service', () => {
  beforeEach(() => {
    createdClients.length = 0;
  });

  it('connects with Authorization header and subscribes/parses messages', async () => {
    const handler = vi.fn();
    webSocketService.setAccessToken('token-123');

    await webSocketService.connect();
    const client = createdClients[0];
    expect(client.opts.connectHeaders.Authorization).toBe('Bearer token-123');

    webSocketService.subscribeToGameState('ROOM1', handler);
    const sub = client.lastSubscription;
    expect(sub.destination).toBe('/topic/game/ROOM1/state');

    sub.cb({ body: JSON.stringify({ status: 'RUNNING' }) });
    expect(handler).toHaveBeenCalledWith({ status: 'RUNNING' });
  });

  it('publishes player move, bomb and powerup when connected', async () => {
    webSocketService.setAccessToken(null);
    await webSocketService.connect();
    const client = createdClients[0];

    webSocketService.sendPlayerMove({ sessionId: 'S1', playerId: 'P1', direction: 'UP' as any });
    expect(client.lastPublish.destination).toBe('/app/game/move');

    webSocketService.sendPlaceBomb({ sessionId: 'S1', playerId: 'P1', position: { x: 1, y: 1 } });
    expect(client.lastPublish.destination).toBe('/app/game/bomb');

    webSocketService.sendPowerUpCollect({ sessionId: 'S1', playerId: 'P1', powerUpId: 'PU1' });
    expect(client.lastPublish.destination).toBe('/app/game/powerup');
  });
});
