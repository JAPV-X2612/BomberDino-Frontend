export enum GameStatus {
  WAITING = 'WAITING',
  STARTING = 'STARTING',
  IN_PROGRESS = 'IN_PROGRESS',
  PAUSED = 'PAUSED',
  FINISHED = 'FINISHED',
}

export enum PlayerStatus {
  ALIVE = 'ALIVE',
  DEAD = 'DEAD',
  SPECTATING = 'SPECTATING',
}

export interface CreateRoomRequest {
  roomName: string;
  maxPlayers: number;
  mapId: string;
  isPrivate: boolean;
  password?: string | null;
}

export interface JoinRoomRequest {
  roomId: string;
  playerId: string;
  username: string;
  password?: string | null;
}

export interface GameRoomResponse {
  roomId: string;
  roomName: string;
  roomCode: string;
  status: GameStatus;
  currentPlayers: PlayerDTO[];
  maxPlayers: number;
  isPrivate: boolean;
  playerId: string;
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
}
