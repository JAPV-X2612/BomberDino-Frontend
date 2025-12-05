import { beforeEach, describe, expect, it, vi } from 'vitest';
import { syncManager } from '@/utils/SyncManager';
import { gameApiService } from '@/services/game-api.service';
import type { GameStateUpdate } from '@/types/websocket-types';

vi.mock('@/services/game-api.service', () => ({
  gameApiService: {
    getFullGameState: vi.fn(),
  },
}));

const sessionId = 'session-1';

describe('SyncManager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    syncManager.resetSession(sessionId);
  });

  it('accepts increasing sequence numbers and rejects duplicates', () => {
    const first = syncManager.checkSequenceNumber(sessionId, 1, 'player-moved');
    const second = syncManager.checkSequenceNumber(sessionId, 2, 'player-moved');
    const duplicate = syncManager.checkSequenceNumber(sessionId, 2, 'player-moved');

    expect(first).toBe(true);
    expect(second).toBe(true);
    expect(duplicate).toBe(false);
  });

  it('triggers resync when too many messages are missed', async () => {
    const mockState: GameStateUpdate = {
      sessionId,
      status: 'RUNNING',
      tiles: [],
      players: [],
      bombs: [],
      explosions: [],
      powerUps: [],
      serverTime: Date.now(),
    };

    const resyncCallback = vi.fn();
    syncManager.setResyncCallback(resyncCallback);
    (gameApiService.getFullGameState as unknown as vi.Mock).mockResolvedValue(mockState);

    syncManager.checkSequenceNumber(sessionId, 1, 'player-moved');
    const result = syncManager.checkSequenceNumber(sessionId, 10, 'player-moved');

    expect(result).toBe(false);

    // Wait for async resync to complete
    await Promise.resolve();
    await Promise.resolve();

    expect(gameApiService.getFullGameState).toHaveBeenCalledWith(sessionId);
    expect(resyncCallback).toHaveBeenCalledWith(mockState);
  });

  it('requests resync when heartbeat times out', async () => {
    vi.useFakeTimers();

    const mockState: GameStateUpdate = {
      sessionId,
      status: 'RUNNING',
      tiles: [],
      players: [],
      bombs: [],
      explosions: [],
      powerUps: [],
      serverTime: Date.now(),
    };

    const resyncCallback = vi.fn();
    syncManager.setResyncCallback(resyncCallback);
    (gameApiService.getFullGameState as unknown as vi.Mock).mockResolvedValue(mockState);

    syncManager.checkSequenceNumber(sessionId, 1, 'heartbeat');
    syncManager.updateHeartbeat();

    vi.advanceTimersByTime(4001);
    syncManager.checkHeartbeat(sessionId);

    await Promise.resolve();
    await Promise.resolve();

    expect(resyncCallback).toHaveBeenCalledWith(mockState);

    vi.useRealTimers();
  });
});
