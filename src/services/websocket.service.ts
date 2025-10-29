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
} from '@/types/websocket-types';

const WS_BASE_URL = import.meta.env.VITE_WS_BASE_URL || 'http://localhost:8080'; // TODO: Validate URL from deployment
const WS_ENDPOINT = '/ws';

type MessageHandler<T> = (data: T) => void;

class WebSocketService {
  private client: Client | null = null;
  private subscriptions: Map<string, StompSubscription> = new Map();
  private isConnected: boolean = false;
  private reconnectAttempts: number = 0;
  private readonly maxReconnectAttempts: number = 5;

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.client = new Client({
        webSocketFactory: () => new SockJS(`${WS_BASE_URL}${WS_ENDPOINT}`),
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

  unsubscribe(destination: string): void {
    const subscription = this.subscriptions.get(destination);
    if (subscription) {
      subscription.unsubscribe();
      this.subscriptions.delete(destination);
      console.log(`Unsubscribed from ${destination}`);
    }
  }

  sendPlayerMove(request: PlayerMoveRequest): void {
    this.send('/app/game/move', request);
  }

  sendPlaceBomb(request: PlaceBombRequest): void {
    this.send('/app/game/bomb', request);
  }

  sendPowerUpCollect(request: PowerUpCollectRequest): void {
    this.send('/app/game/powerup', request);
  }

  private send<T>(destination: string, body: T): void {
    if (!this.client || !this.isConnected) {
      console.error('Cannot send: WebSocket not connected');
      return;
    }

    this.client.publish({
      destination,
      body: JSON.stringify(body),
    });
  }

  isConnectedStatus(): boolean {
    return this.isConnected;
  }
}

export const webSocketService = new WebSocketService();
