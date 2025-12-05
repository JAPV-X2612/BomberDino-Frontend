import { describe, expect, it, vi, beforeEach } from 'vitest';
import { syncManager } from '@/utils/SyncManager';
import { gameApiService } from '@/services/game-api.service';

vi.mock('@/services/game-api.service', () => ({
  gameApiService: {
    getFullGameState: vi.fn(),
  },
}));

const sessionId = 's-extra';

describe('SyncManager extra branches', () => {
  beforeEach(() => {
    syncManager.resetSession(sessionId);
    vi.clearAllMocks();
  });

  it('skips triggerResync if one is already in progress', async () => {
    (gameApiService.getFullGameState as vi.Mock).mockResolvedValue({ sessionId } as any);

    // Start a resync but do not await so in-progress flag stays
    const first = syncManager.triggerResync(sessionId);
    const second = syncManager.triggerResync(sessionId);

    await first;
    await second;

    expect(gameApiService.getFullGameState).toHaveBeenCalledTimes(1);
  });

  it('handles errors during resync and still clears in-progress flag', async () => {
    (gameApiService.getFullGameState as vi.Mock).mockRejectedValue(new Error('network'));

    await syncManager.triggerResync(sessionId);

    // should remove session from inProgress even on error
    await syncManager.triggerResync(sessionId);
    expect(gameApiService.getFullGameState).toHaveBeenCalledTimes(2);
  });
});
