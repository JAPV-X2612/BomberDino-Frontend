import { gameApiService } from '@/services/game-api.service';
import type { GameStateUpdate } from '@/types/websocket-types';

/**
 * Manages client-server synchronization for real-time game state.
 * Detects packet loss, connection issues, and triggers resynchronization when needed.
 *
 * Features:
 * - Sequence number tracking to detect lost packets
 * - Heartbeat monitoring to detect connection loss
 * - Automatic resync requests with throttling
 * - Manual resync capability
 *
 * @author Claude AI Assistant
 * @version 2.0
 * @since 2025-11-26
 */
export class SyncManager {
  private lastSequenceNumbers: Map<string, number> = new Map();
  private lastHeartbeat: number = Date.now();
  private readonly HEARTBEAT_TIMEOUT = 2000; // 2 seconds
  private readonly SYNC_REQUEST_COOLDOWN = 5000; // 5 seconds
  private lastSyncRequest: number = 0;
  private resyncCallback?: (state: GameStateUpdate) => void;

  /**
   * Sets the callback to be called when a resync is completed.
   */
  setResyncCallback(callback: (state: GameStateUpdate) => void): void {
    this.resyncCallback = callback;
  }

  /**
   * Checks sequence number continuity to detect lost packets.
   * If packets are missing, triggers automatic resynchronization.
   *
   * @param sessionId Game session identifier
   * @param seqNum Sequence number from server event
   * @param eventType Type of event (for logging)
   * @returns true if sequence is valid, false if packets were lost
   */
  checkSequenceNumber(sessionId: string, seqNum: number, eventType: string = 'unknown'): boolean {
    const lastSeq = this.lastSequenceNumbers.get(sessionId) || 0;

    // First message or valid sequence
    if (lastSeq === 0 || seqNum === lastSeq + 1) {
      this.lastSequenceNumbers.set(sessionId, seqNum);
      return true;
    }

    // Sequence gap detected - packet loss!
    if (seqNum > lastSeq + 1) {
      const lostPackets = seqNum - lastSeq - 1;
      console.warn(
        `⚠️ Packet loss detected! Expected seq ${lastSeq + 1}, got ${seqNum} (${lostPackets} packets lost)`,
        `Event type: ${eventType}`,
      );
      this.requestResync(sessionId, `packet_loss_${eventType}`);
      this.lastSequenceNumbers.set(sessionId, seqNum);
      return false;
    }

    // Duplicate or out-of-order packet (ignore)
    if (seqNum <= lastSeq) {
      console.warn(`⚠️ Duplicate/old packet: seq ${seqNum} (current: ${lastSeq})`);
      return false;
    }

    return true;
  }

  /**
   * Updates the last heartbeat timestamp.
   * Call this when receiving heartbeat events from the server.
   */
  updateHeartbeat(): void {
    this.lastHeartbeat = Date.now();
  }

  /**
   * Checks if the server heartbeat has timed out.
   * Should be called periodically (e.g., every second) to detect connection loss.
   *
   * @param sessionId Game session identifier
   */
  checkHeartbeat(sessionId: string): void {
    const now = Date.now();

    if (now - this.lastHeartbeat > this.HEARTBEAT_TIMEOUT) {
      console.error('❌ Server heartbeat timeout! Connection may be lost.');
      this.requestResync(sessionId, 'heartbeat_timeout');
    }
  }

  /**
   * Manually requests a full state resynchronization from the server.
   * Use this when you detect desynchronization issues.
   *
   * @param sessionId Game session identifier
   */
  requestManualResync(sessionId: string): void {
    console.log('🔄 Manual resync requested by user');
    this.requestResync(sessionId, 'manual', true);
  }

  /**
   * Internal method to request resynchronization with throttling.
   *
   * @param sessionId Game session identifier
   * @param reason Reason for resync (for logging)
   * @param force Force resync even if cooldown hasn't passed
   */
  private requestResync(sessionId: string, reason: string, force: boolean = false): void {
    const now = Date.now();

    // Throttle: no more than 1 request every 5 seconds (unless forced)
    if (!force && now - this.lastSyncRequest < this.SYNC_REQUEST_COOLDOWN) {
      console.log(
        `⏱️ Resync throttled (last request ${Math.floor((now - this.lastSyncRequest) / 1000)}s ago)`,
      );
      return;
    }

    console.log(`🔄 Requesting full state resync (reason: ${reason})...`);
    this.lastSyncRequest = now;

    // Request full state from backend via REST API
    gameApiService
      .getFullGameState(sessionId)
      .then((state) => {
        console.log('✅ Resync successful', state);

        // Call the resync callback if set
        if (this.resyncCallback) {
          this.resyncCallback(state);
        }

        // Dispatch custom event for components listening
        window.dispatchEvent(
          new CustomEvent('force-resync', {
            detail: state,
          }),
        );
      })
      .catch((error) => {
        console.error('❌ Resync failed:', error);
      });
  }

  /**
   * Resets all tracking for a session.
   * Call this when leaving a game or when a game ends.
   *
   * @param sessionId Game session identifier
   */
  resetSession(sessionId: string): void {
    this.lastSequenceNumbers.delete(sessionId);
    this.lastHeartbeat = Date.now();
    this.lastSyncRequest = 0;
  }

  /**
   * Clears all tracking data.
   * Call this when disconnecting completely.
   */
  clearAll(): void {
    this.lastSequenceNumbers.clear();
    this.lastHeartbeat = Date.now();
    this.lastSyncRequest = 0;
  }
}

// Singleton instance
export const syncManager = new SyncManager();
