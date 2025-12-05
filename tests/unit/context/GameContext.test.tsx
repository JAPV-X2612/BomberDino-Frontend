import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { render, waitFor, act } from '@testing-library/react';
import { GameProvider, useGame } from '@/context/GameContext';
import { Direction, type GameStateUpdate } from '@/types/websocket-types';
import { GameStatus, type GameRoomResponse } from '@/types/api-types';

const mocks = vi.hoisted(() => ({
  mockConnect: vi.fn().mockResolvedValue(undefined),
  mockDisconnect: vi.fn(),
  mockSetAccessToken: vi.fn(),
  mockSubscribe: vi.fn(),
  mockSendPlayerMove: vi.fn(),
  mockSendPlaceBomb: vi.fn(),
  mockSendPowerUpCollect: vi.fn(),
  mockCreateRoom: vi.fn(),
  mockJoinRoom: vi.fn(),
  mockStartGame: vi.fn(),
  mockLeaveRoom: vi.fn(),
}));

vi.mock('@/context/AuthContext', () => ({
  useAuth: () => ({
    accessToken: 'token-123',
  }),
}));

vi.mock('@/services/api.service', () => ({
  apiService: {
    setAccessToken: vi.fn(),
  },
}));

vi.mock('@/utils/SyncManager', () => ({
  syncManager: {
    setResyncCallback: vi.fn(),
    checkSequenceNumber: vi.fn().mockReturnValue(true),
    updateHeartbeat: vi.fn(),
    checkHeartbeat: vi.fn(),
    resetSession: vi.fn(),
  },
}));

vi.mock('@/services/websocket.service', () => ({
  webSocketService: {
    connect: mocks.mockConnect,
    disconnect: mocks.mockDisconnect,
    setAccessToken: mocks.mockSetAccessToken,
    subscribeToPlayerMoved: mocks.mockSubscribe,
    subscribeToBombPlaced: mocks.mockSubscribe,
    subscribeToGameState: mocks.mockSubscribe,
    subscribeToPeriodicSync: mocks.mockSubscribe,
    subscribeToHeartbeat: mocks.mockSubscribe,
    subscribeToBombExploded: mocks.mockSubscribe,
    subscribeToPlayerKilled: mocks.mockSubscribe,
    subscribeToPowerUpCollected: mocks.mockSubscribe,
    subscribeToPlayerDisconnect: mocks.mockSubscribe,
    subscribeToGameStart: mocks.mockSubscribe,
    sendPlayerMove: mocks.mockSendPlayerMove,
    sendPlaceBomb: mocks.mockSendPlaceBomb,
    sendPowerUpCollect: mocks.mockSendPowerUpCollect,
  },
}));

vi.mock('@/services/game-api.service', () => ({
  gameApiService: {
    createRoom: (...args: unknown[]) => mocks.mockCreateRoom(...args),
    joinRoom: (...args: unknown[]) => mocks.mockJoinRoom(...args),
    startGame: (...args: unknown[]) => mocks.mockStartGame(...args),
    leaveRoom: (...args: unknown[]) => mocks.mockLeaveRoom(...args),
    getFullGameState: vi.fn().mockResolvedValue({} as GameStateUpdate),
  },
}));

let capturedContext: ReturnType<typeof useGame> | null = null;

const ContextConsumer = () => {
  capturedContext = useGame();
  return null;
};

describe('GameContext', () => {
  beforeEach(() => {
    capturedContext = null;
    vi.clearAllMocks();
    Object.values(mocks).forEach((maybeFn) => {
      if (typeof maybeFn === 'function') {
        (maybeFn as vi.Mock).mockClear();
      }
    });
  });

  afterEach(() => {
    capturedContext = null;
  });

  const renderProvider = () =>
    render(
      <GameProvider>
        <ContextConsumer />
      </GameProvider>,
    );

  it('connects on mount and exposes context', async () => {
    renderProvider();

    await waitFor(() => expect(mocks.mockConnect).toHaveBeenCalled());
    expect(mocks.mockSetAccessToken).toHaveBeenCalledWith('token-123');
    expect(capturedContext).not.toBeNull();
  });

  it('creates room, subscribes and stores session', async () => {
    const roomResponse: GameRoomResponse = {
      roomId: 'room-1',
      roomName: 'Tester Room',
      roomCode: 'ABC123',
      status: GameStatus.WAITING,
      currentPlayers: [],
      maxPlayers: 4,
      isPrivate: false,
      playerId: 'creator',
    };
    mocks.mockCreateRoom.mockResolvedValue(roomResponse);

    renderProvider();
    await waitFor(() => expect(mocks.mockConnect).toHaveBeenCalled());

    await act(async () => {
      await capturedContext!.createRoom('Room', 4, 'map');
    });

    await waitFor(() => expect(capturedContext!.sessionId).toBe('ABC123'));
    expect(mocks.mockSubscribe).toHaveBeenCalled();
  });

  it('joins room, sets playerId from server and wires subscriptions', async () => {
    const joinResponse: GameRoomResponse = {
      roomId: 'room-2',
      roomName: 'Room2',
      roomCode: 'ROOM22',
      status: GameStatus.WAITING,
      currentPlayers: [
        {
          id: 'server-player',
          username: 'Tester',
          posX: 0,
          posY: 0,
          lifeCount: 3,
          status: GameStatus.WAITING as unknown as never,
          kills: 0,
          deaths: 0,
          hasShield: false,
        } as never,
      ],
      maxPlayers: 4,
      isPrivate: false,
      playerId: 'server-player',
    };
    mocks.mockJoinRoom.mockResolvedValue(joinResponse);

    renderProvider();
    await waitFor(() => expect(mocks.mockConnect).toHaveBeenCalled());

    await act(async () => {
      await capturedContext!.joinRoom('ROOM22', 'local-player', 'Tester');
    });

    await waitFor(() => expect(capturedContext!.sessionId).toBe('ROOM22'));
    expect(capturedContext!.playerId).toBe('server-player');
    expect(mocks.mockSubscribe).toHaveBeenCalled();
  });

  it('sends move and place bomb when session and player exist', async () => {
    mocks.mockJoinRoom.mockResolvedValue({
      roomId: 'room-3',
      roomName: 'Room3',
      roomCode: 'ROOM33',
      status: GameStatus.WAITING,
      currentPlayers: [
        {
          id: 'p33',
          username: 'Tester',
          posX: 0,
          posY: 0,
          lifeCount: 3,
          status: GameStatus.WAITING as unknown as never,
          kills: 0,
          deaths: 0,
          hasShield: false,
        } as never,
      ],
      maxPlayers: 4,
      isPrivate: false,
      playerId: 'p33',
    } satisfies GameRoomResponse);

    renderProvider();
    await waitFor(() => expect(mocks.mockConnect).toHaveBeenCalled());

    await act(async () => {
      await capturedContext!.joinRoom('ROOM33', 'local', 'Tester');
    });

    capturedContext!.sendMove(Direction.UP);
    capturedContext!.placeBomb({ x: 1, y: 1 });
    capturedContext!.collectPowerUp('power-1');

    expect(mocks.mockSendPlayerMove).toHaveBeenCalledWith(
      expect.objectContaining({ sessionId: 'ROOM33', playerId: 'p33', direction: Direction.UP }),
    );
    expect(mocks.mockSendPlaceBomb).toHaveBeenCalled();
    expect(mocks.mockSendPowerUpCollect).toHaveBeenCalled();
  });

  it('leaves room and clears session/player', async () => {
    mocks.mockJoinRoom.mockResolvedValue({
      roomId: 'room-4',
      roomName: 'Room4',
      roomCode: 'ROOM44',
      status: GameStatus.WAITING,
      currentPlayers: [],
      maxPlayers: 4,
      isPrivate: false,
      playerId: 'player-4',
    } satisfies GameRoomResponse);

    renderProvider();
    await waitFor(() => expect(mocks.mockConnect).toHaveBeenCalled());

    await act(async () => {
      await capturedContext!.joinRoom('ROOM44', 'local', 'Tester');
    });

    await act(async () => {
      await capturedContext!.leaveRoom();
    });

    expect(mocks.mockLeaveRoom).toHaveBeenCalledWith('ROOM44', 'local');
    expect(capturedContext!.sessionId).toBeNull();
    expect(capturedContext!.playerId).toBeNull();
  });

  it('calls startGame with session and player identifiers', async () => {
    mocks.mockJoinRoom.mockResolvedValue({
      roomId: 'room-5',
      roomName: 'Room5',
      roomCode: 'ROOM55',
      status: GameStatus.WAITING,
      currentPlayers: [],
      maxPlayers: 4,
      isPrivate: false,
      playerId: 'player-5',
    } satisfies GameRoomResponse);

    renderProvider();
    await waitFor(() => expect(mocks.mockConnect).toHaveBeenCalled());

    await act(async () => {
      await capturedContext!.joinRoom('ROOM55', 'local', 'Tester');
    });

    await act(async () => {
      await capturedContext!.startGame();
    });

    expect(mocks.mockStartGame).toHaveBeenCalledWith('ROOM55', 'local');
  });
});
