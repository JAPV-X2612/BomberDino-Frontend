import { PlayerStatus } from './api-types';

export type GamePhase = 'LOBBY' | 'RUNNING' | 'ENDED';

export enum Direction {
  UP = 'UP',
  DOWN = 'DOWN',
  LEFT = 'LEFT',
  RIGHT = 'RIGHT',
}

export enum PowerUpType {
  EXTRA_LIFE = 'EXTRA_LIFE',
  SPEED_UP = 'SPEED_UP',
  BOMB_COUNT_UP = 'BOMB_COUNT_UP',
  BOMB_RANGE_UP = 'BOMB_RANGE_UP',
  TEMPORARY_SHIELD = 'TEMPORARY_SHIELD',
}

export interface Point {
  x: number;
  y: number;
}

export interface PlayerDTO {
  id: string;
  username: string;
  posX: number;
  posY: number;
  lifeCount: number;
  status: PlayerStatus;
  kills: number;
  deaths: number;
  hasShield: boolean;
  bombCount: number;
  bombRange: number;
  speed: number;
}

export interface BombDTO {
  id: string;
  ownerId: string;
  posX: number;
  posY: number;
  range: number;
  timeToExplode: number;
}

export interface PowerUpDTO {
  id: string;
  type: PowerUpType;
  posX: number;
  posY: number;
}

export interface GameStateUpdate {
  sessionId: string;
  players: PlayerDTO[];
  bombs: BombDTO[];
  powerUps: PowerUpDTO[];
  timestamp: number;
  phase: GamePhase;
}

export interface StartGameRequest {
  sessionId: string;
  playerId: string;
}

export interface GameStartNotification {
  sessionId: string;
  initialState: GameStateUpdate;
  timestamp: number;
}

export interface PlayerMoveRequest {
  sessionId: string;
  playerId: string;
  direction: Direction;
}

export interface PlaceBombRequest {
  sessionId: string;
  playerId: string;
  position: Point;
}

export interface PowerUpCollectRequest {
  sessionId: string;
  playerId: string;
  powerUpId: string;
}

export interface BombExplodedEvent {
  sessionId: string;
  bombId: string;
  affectedTiles: Point[];
  affectedPlayers: string[];
  timestamp: number;
}

export interface PlayerKilledEvent {
  sessionId: string;
  killerId: string | null;
  victimId: string;
  timestamp: number;
}

export interface PowerUpCollectedEvent {
  sessionId: string;
  playerId: string;
  powerUpId: string;
  effect: {
    type: PowerUpType;
    duration: number;
    multiplier: number;
  };
  timestamp: number;
}
