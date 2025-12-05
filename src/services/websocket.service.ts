import { Client, type IMessage, type StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import type {
  GameStateUpdate,
  PlayerMoveRequest,
  PlaceBombRequest,
  PowerUpCollectRequest,
  BombExplodedEvent,
  PlayerKilledEvent,
  PowerUpCollectedEvent,
  GameStartNotification,
  PlayerMovedEvent,
  BombPlacedEvent,
  HeartbeatEvent,
  PowerUpSpawnedEvent,
} from '@/types/websocket-types';

/**
 * Determines the WebSocket base URL from environment variables.
 */
const getWebSocketBaseUrl = (): string => {
  const envUrl = import.meta.env.VITE_WS_BASE_URL;

  if (!envUrl) {
    console.warn('VITE_WS_BASE_URL not set, using localhost');
    return 'http://localhost:8080';
  }

  console.log('WebSocket connecting to:', envUrl);
  return envUrl;
};

const WS_BASE_URL = getWebSocketBaseUrl();
const WS_ENDPOINT = '/ws';

type MessageHandler<T> = (data: T) => void;

/**
 * WebSocket service for real-time game communication.
 * Supports JWT authentication for secure connections.
 */
class WebSocketService {
  private client: Client | null = null;
  private subscriptions: Map<string, StompSubscription> = new Map();
  private isConnected: boolean = false;
  private reconnectAttempts: number = 0;
  private readonly maxReconnectAttempts: number = 5;
  private accessToken: string | null = null;

  /**
   * Sets the access token for authenticated WebSocket connections.
   * @param token JWT access token
   */
  setAccessToken(token: string | null): void {
    this.accessToken = token;
  }

  /**
   * Connects to WebSocket server with optional JWT authentication.
   * @returns Promise that resolves when connected
   */
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      const connectHeaders: Record<string, string> = {};

      if (this.accessToken) {
        connectHeaders['Authorization'] = `Bearer ${this.accessToken}`;
      }

      this.client = new Client({
        webSocketFactory: () => new SockJS(`${WS_BASE_URL}${WS_ENDPOINT}`),
        connectHeaders,
        debug: (str) => console.log('[STOMP Debug]', str),
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
        onConnect: () => {
          console.log('WebSocket connected');
          this.isConnected = true;
          this.reconnectAttempts = 0;
          resolve();
        },
        onStompError: (frame) => {
          console.error('STOMP error:', frame.headers['message'], frame.body);
          reject(new Error(frame.headers['message']));
        },
        onWebSocketClose: () => {
          console.log('WebSocket closed');
          this.isConnected = false;
          this.handleReconnection();
        },
      });

      this.client.activate();
    });
  }

  private handleReconnection(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Reconnection attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
    } else {
      console.error('Max reconnection attempts reached');
    }
  }

  disconnect(): void {
    if (this.client) {
      this.subscriptions.forEach((sub) => sub.unsubscribe());
      this.subscriptions.clear();
      this.client.deactivate();
      this.isConnected = false;
    }
  }

  subscribeToGameState(sessionId: string, handler: MessageHandler<GameStateUpdate>): void {
    this.subscribe(`/topic/game/${sessionId}/state`, handler);
  }

  subscribeToGameStart(
    sessionId: string,
    callback: (notification: GameStartNotification) => void,
  ): void {
    const destination = `/topic/game/${sessionId}/start`;
    this.client?.subscribe(destination, (message) => {
      const notification = JSON.parse(message.body) as GameStartNotification;
      callback(notification);
    });
  }

  subscribeToPlayerKilled(sessionId: string, handler: MessageHandler<PlayerKilledEvent>): void {
    this.subscribe(`/topic/game/${sessionId}/kill`, handler);
  }

  subscribeToBombExploded(sessionId: string, handler: MessageHandler<BombExplodedEvent>): void {
    this.subscribe(`/topic/game/${sessionId}/explosion`, handler);
  }

  subscribeToPowerUpCollected(
    sessionId: string,
    handler: MessageHandler<PowerUpCollectedEvent>,
  ): void {
    this.subscribe(`/topic/game/${sessionId}/powerup`, handler);
  }

  subscribeToPlayerDisconnect(
    sessionId: string,
    handler: MessageHandler<{ playerId: string }>,
  ): void {
    this.subscribe(`/topic/game/${sessionId}/disconnect`, handler);
  }

  // ============================================================================
  // NEW EVENT-DRIVEN SUBSCRIPTIONS (Performance Optimization)
  // ============================================================================

  /**
   * Subscribe to lightweight player movement events.
   * Replaces subscribeToGameState for individual player moves.
   */
  subscribeToPlayerMoved(sessionId: string, handler: MessageHandler<PlayerMovedEvent>): void {
    this.subscribe(`/topic/game/${sessionId}/player-moved`, handler);
  }

  /**
   * Subscribe to lightweight bomb placement events.
   * Replaces subscribeToGameState for bomb placements.
   */
  subscribeToBombPlaced(sessionId: string, handler: MessageHandler<BombPlacedEvent>): void {
    this.subscribe(`/topic/game/${sessionId}/bomb-placed`, handler);
  }

  /**
   * Subscribe to heartbeat events (sent every 500ms).
   * Allows detection of connection loss and packet loss.
   */
  subscribeToHeartbeat(sessionId: string, handler: MessageHandler<HeartbeatEvent>): void {
    this.subscribe(`/topic/game/${sessionId}/heartbeat`, handler);
  }

  /**
   * Subscribe to periodic full state synchronization (sent every 5 seconds).
   * Acts as a checkpoint to prevent drift from accumulated delta updates.
   */
  subscribeToPeriodicSync(sessionId: string, handler: MessageHandler<GameStateUpdate>): void {
    this.subscribe(`/topic/game/${sessionId}/sync`, handler);
  }

  /**
   * Subscribe to power-up spawn events.
   */
  subscribeToPowerUpSpawned(sessionId: string, handler: MessageHandler<PowerUpSpawnedEvent>): void {
    this.subscribe(`/topic/game/${sessionId}/powerup-spawned`, handler);
  }

  private subscribe<T>(destination: string, handler: MessageHandler<T>): void {
    if (!this.client || !this.isConnected) {
      console.error('Cannot subscribe: WebSocket not connected');
      return;
    }

    if (this.subscriptions.has(destination)) {
      console.warn(`Already subscribed to ${destination}`);
      return;
    }

    const subscription = this.client.subscribe(destination, (message: IMessage) => {
      // console.log('📩 Message received in', destination, ':', message.body);
      try {
        const data = JSON.parse(message.body) as T;
        handler(data);
      } catch (error) {
        console.error(`Error parsing message from ${destination}:`, error);
      }
    });

    this.subscriptions.set(destination, subscription);
    console.log(`Subscribed to ${destination}`);
  }

  sendPlayerMove(request: PlayerMoveRequest): void {
    if (!this.client?.connected) return;

    const payload = {
      ...request,
      timestamp: Date.now(),
    };

    // console.log('📤 Sending move:', payload);

    this.client.publish({
      destination: '/app/game/move',
      body: JSON.stringify(payload),
    });
  }

  sendPlaceBomb(request: PlaceBombRequest): void {
    if (!this.client?.connected) return;

    this.client.publish({
      destination: '/app/game/bomb',
      body: JSON.stringify({
        ...request,
        timestamp: Date.now(),
      }),
    });
  }

  sendPowerUpCollect(request: PowerUpCollectRequest): void {
    if (!this.client?.connected) return;

    this.client.publish({
      destination: '/app/game/powerup',
      body: JSON.stringify({
        ...request,
        timestamp: Date.now(),
      }),
    });
  }
}

export const webSocketService = new WebSocketService();
