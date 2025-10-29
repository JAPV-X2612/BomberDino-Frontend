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
    isPrivate: boolean;
    password?: string | null;
}

export interface JoinRoomRequest {
    roomId: string;
    playerId: string;
    password?: string | null;
}

export interface GameRoomResponse {
    roomId: string;
    roomName: string;
    status: GameStatus;
    currentPlayers: number;
    maxPlayers: number;
    isPrivate: boolean;
}
