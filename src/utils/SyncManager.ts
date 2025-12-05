import { gameApiService } from '@/services/game-api.service';
import type { GameStateUpdate } from '@/types/websocket-types';

/**
 * SYNC MANAGER - Client-side synchronization controller
 *
 * Responsibilities:
 * 1. Track sequence numbers to detect lost messages
 * 2. Monitor heartbeat to detect connection issues
 * 3. Trigger automatic resynchronization when needed
 * 4. Prevent duplicate sequence numbers
 *
 * Part of the HYBRID ARCHITECTURE for eliminating flicker while maintaining sync.
 */
class SyncManager {

  private lastSequenceNumbers: Map<string, Map<string, number>> = new Map();
  private lastHeartbeat: Map<string, number> = new Map();
  private resyncCallback: ((state: GameStateUpdate) => void) | null = null;
  private resyncInProgress: Set<string> = new Set();

  /**
   * Sets the callback function to execute when resync is needed.
   * This will fetch full state and update the game.
   */
  setResyncCallback(callback: (state: GameStateUpdate) => void): void {
    this.resyncCallback = callback;
  }

  /**
   * Checks if a sequence number is valid and updates tracking.
   *
   * @param sessionId - Current game session ID
   * @param sequenceNumber - Sequence number from server message
   * @param eventType - Type of event (player-moved, bomb-placed, heartbeat)
   * @returns true if sequence is valid, false if missed messages detected
   */
  checkSequenceNumber(sessionId: string, sequenceNumber: number, eventType: string): boolean {
    if (!this.lastSequenceNumbers.has(sessionId)) {
      this.lastSequenceNumbers.set(sessionId, new Map());
    }

    const sessionSeq = this.lastSequenceNumbers.get(sessionId)!;
    const lastSeq = sessionSeq.get(eventType) || 0;

    if (sequenceNumber > lastSeq + 1 && lastSeq !== 0) {
      const missedCount = sequenceNumber - lastSeq - 1;
      console.warn(
        `⚠️ Missed ${missedCount} ${eventType} messages (last: ${lastSeq}, current: ${sequenceNumber})`,
      );

      if (missedCount > 5) {
        console.error(`❌ Too many missed messages, triggering resync...`);
        this.triggerResync(sessionId);
        return false;
      }
    }

    if (sequenceNumber <= lastSeq) {
      console.warn(
        `⚠️ Duplicate or out-of-order ${eventType} (last: ${lastSeq}, current: ${sequenceNumber})`,
      );
      return false;
    }

    sessionSeq.set(eventType, sequenceNumber);
    return true;
  }

  /**
   * Updates heartbeat timestamp for connection monitoring.
   */
  updateHeartbeat(): void {
    const sessionId = Array.from(this.lastSequenceNumbers.keys())[0];
    if (sessionId) {
      this.lastHeartbeat.set(sessionId, Date.now());
    }
  }

  /**
   * Checks if heartbeat is recent enough (connection alive).
   * Triggers resync if connection seems lost.
   *
   * @param sessionId - Current game session ID
   */
  checkHeartbeat(sessionId: string): void {
    const lastBeat = this.lastHeartbeat.get(sessionId);

    if (!lastBeat) return;

    const timeSinceLastBeat = Date.now() - lastBeat;
    const HEARTBEAT_TIMEOUT = 2000;

    if (timeSinceLastBeat > HEARTBEAT_TIMEOUT) {
      console.warn(`⚠️ No heartbeat for ${timeSinceLastBeat}ms, connection may be lost`);

      if (timeSinceLastBeat > 3000) {
        console.error(`❌ Heartbeat timeout, triggering resync...`);
        this.triggerResync(sessionId);
      }
    }
  }

  /**
   * Triggers manual resynchronization by fetching full game state.
   *
   * @param sessionId - Current game session ID
   */
  async triggerResync(sessionId: string): Promise<void> {
    if (this.resyncInProgress.has(sessionId)) {
      console.log(`🔄 Resync already in progress for session ${sessionId}`);
      return;
    }

    this.resyncInProgress.add(sessionId);

    try {
      console.log(`🔄 Fetching full state for resync...`);

      const fullState = await gameApiService.getFullGameState(sessionId);

      if (this.resyncCallback && fullState) {
        this.resyncCallback(fullState);
        console.log(`✅ Resync completed successfully`);
      }

      this.resetSequenceTracking(sessionId);
    } catch (error) {
      console.error(`❌ Resync failed:`, error);
    } finally {
      this.resyncInProgress.delete(sessionId);
    }
  }

  /**
   * Resets sequence tracking for a session (called after resync).
   */
  private resetSequenceTracking(sessionId: string): void {
    const sessionSeq = this.lastSequenceNumbers.get(sessionId);
    if (sessionSeq) {
      sessionSeq.clear();
    }
  }

  /**
   * Resets all tracking for a session (called on disconnect).
   */
  resetSession(sessionId: string): void {
    this.lastSequenceNumbers.delete(sessionId);
    this.lastHeartbeat.delete(sessionId);
    this.resyncInProgress.delete(sessionId);
  }
}

export const syncManager = new SyncManager();
