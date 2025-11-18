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
  status: string; // 'WAITING' | 'IN_PROGRESS' | 'FINISHED'
  tiles: TileDTO[][];
  players: PlayerDTO[];
  bombs: BombDTO[];
  explosions: ExplosionDTO[]; // Agregar si no existe
  powerUps: PowerUpDTO[];
  serverTime: number;
  timestamp?: number;
  phase?: GamePhase;
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

export enum TileType {
  EMPTY = 'EMPTY',
  SOLID_WALL = 'SOLID_WALL',
  DESTRUCTIBLE_WALL = 'DESTRUCTIBLE_WALL',
}

export interface TileDTO {
  x: number;
  y: number;
  type: TileType;
  occupied: boolean;
  destructible: boolean;
  hasBomb: boolean;
  hasPowerUp: boolean;
}

export interface ExplosionDTO {
  id: string;
  posX: number;
  posY: number;
  range: number;
  remainingTime: number;
}
