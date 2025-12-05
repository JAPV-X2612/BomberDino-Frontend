import { describe, expect, it, vi } from 'vitest';
import { gameApiService } from '@/services/game-api.service';
import { GameStatus, type GameRoomResponse } from '@/types/api-types';
import type { GameStateUpdate } from '@/types/websocket-types';

const mocks = vi.hoisted(() => ({
  post: vi.fn(),
  get: vi.fn(),
  delete: vi.fn(),
}));

vi.mock('@/services/api.service', () => ({
  apiClient: {
    post: (...args: unknown[]) => mocks.post(...args),
    get: (...args: unknown[]) => mocks.get(...args),
    delete: (...args: unknown[]) => mocks.delete(...args),
  },
}));

describe('game-api.service', () => {
  it('creates room with expected payload', async () => {
    const fakeResponse = { data: { roomCode: 'ABC123' } as GameRoomResponse };
    mocks.post.mockResolvedValue(fakeResponse);

    const result = await gameApiService.createRoom({
      roomName: 'Room',
      maxPlayers: 4,
      mapId: 'map-1',
      isPrivate: false,
      password: null,
    });

    expect(mocks.post).toHaveBeenCalledWith('/game/rooms', expect.objectContaining({ roomName: 'Room' }));
    expect(result.roomCode).toBe('ABC123');
  });

  it('joins room and returns response data', async () => {
    const fakeResponse = { data: { roomId: 'room-1' } as GameRoomResponse };
    mocks.post.mockResolvedValue(fakeResponse);

    const result = await gameApiService.joinRoom({
      roomId: 'room-1',
      playerId: 'p1',
      username: 'Tester',
      password: null,
    });

    expect(mocks.post).toHaveBeenCalledWith('/game/rooms/join', expect.any(Object));
    expect(result.roomId).toBe('room-1');
  });

  it('starts game calling the correct endpoint', async () => {
    mocks.post.mockResolvedValue({ data: {} });

    await gameApiService.startGame('ROOM1', 'p1');

    expect(mocks.post).toHaveBeenCalledWith('/game/rooms/ROOM1/start', null, { params: { playerId: 'p1' } });
  });

  it('leaves room via delete call', async () => {
    mocks.delete.mockResolvedValue({ data: {} });

    await gameApiService.leaveRoom('ROOM1', 'p1');

    expect(mocks.delete).toHaveBeenCalledWith('/game/rooms/ROOM1/players/p1');
  });

  it('gets rooms by status', async () => {
    const fakeResponse = { data: [] as GameRoomResponse[] };
    mocks.get.mockResolvedValue(fakeResponse);

    const result = await gameApiService.getRoomsByStatus(GameStatus.WAITING);

    expect(mocks.get).toHaveBeenCalledWith('/game/rooms', { params: { status: GameStatus.WAITING } });
    expect(result).toEqual([]);
  });

  it('fetches full game state for resync', async () => {
    const fakeState = { sessionId: 'ABC', status: 'RUNNING', tiles: [], players: [], bombs: [], explosions: [], powerUps: [], serverTime: 0 } as GameStateUpdate;
    mocks.get.mockResolvedValue({ data: fakeState });

    const result = await gameApiService.getFullGameState('ABC');

    expect(mocks.get).toHaveBeenCalledWith('/game/rooms/ABC/state');
    expect(result).toEqual(fakeState);
  });
});
