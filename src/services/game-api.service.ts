import { apiClient } from './api.service';
import type {
  CreateRoomRequest,
  JoinRoomRequest,
  GameRoomResponse,
  GameStatus,
} from '@/types/api-types';

class GameApiService {
  private readonly basePath = '/game';

  async createRoom(request: CreateRoomRequest): Promise<GameRoomResponse> {
    const response = await apiClient.post<GameRoomResponse>(`${this.basePath}/rooms`, request);
    return response.data;
  }

  async joinRoom(request: JoinRoomRequest): Promise<GameRoomResponse> {
    const response = await apiClient.post<GameRoomResponse>(`${this.basePath}/rooms/join`, request);
    return response.data;
  }

  async startGame(sessionId: string, playerId: string): Promise<void> {
    await apiClient.post(`${this.basePath}/rooms/${sessionId}/start`, null, {
      params: { playerId },
    });
  }

  async getRoomsByStatus(status: GameStatus): Promise<GameRoomResponse[]> {
    const response = await apiClient.get<GameRoomResponse[]>(`${this.basePath}/rooms`, {
      params: { status },
    });
    return response.data;
  }

  async leaveRoom(sessionId: string, playerId: string): Promise<void> {
    await apiClient.delete(`${this.basePath}/rooms/${sessionId}/players/${playerId}`);
  }
}

export const gameApiService = new GameApiService();
