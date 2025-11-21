export enum DinoColor {
  BLUE = 'blue',
  GREEN = 'green',
  ORANGE = 'orange',
  PURPLE = 'purple',
}

export enum PowerUpType {
  SPEED = 'speed',
  EXPLOSION = 'explosion',
  BOMB = 'bomb',
}

export enum GameState {
  WAITING = 'waiting',
  COUNTDOWN = 'countdown',
  PLAYING = 'playing',
  FINISHED = 'finished',
}

export interface Position {
  x: number;
  y: number;
}

export interface Player {
  id: string;
  name: string;
  color: DinoColor;
  position: Position;
  lives: number;
  deaths: number;
  speed: number;
  bombRange: number;
  maxBombs: number;
  isAlive: boolean;
}

export interface Bomb {
  id: string;
  position: Position;
  playerId: string;
  timer: number;
  range: number;
}

export interface PowerUp {
  id: string;
  type: PowerUpType;
  position: Position;
}

export interface Block {
  position: Position;
  destructible: boolean;
}

export interface Room {
  code: string;
  players: Player[];
  maxPlayers: number;
  gameState: GameState;
  hostId: string;
  boardSize: number;
  gameDuration: number;
}

export interface GameConfig {
  boardSize: number;
  maxPlayers: number;
  gameDuration: number;
  initialLives: number;
}
