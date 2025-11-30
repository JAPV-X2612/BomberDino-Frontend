import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { webSocketService } from '@/services/websocket.service';
import { gameApiService } from '@/services/game-api.service';
import type {
  GameStateUpdate,
  PlayerMoveRequest,
  PlaceBombRequest,
  BombExplodedEvent,
  PlayerKilledEvent,
  PowerUpCollectedEvent,
  PlayerMovedEvent,
  BombPlacedEvent,
  HeartbeatEvent,
} from '@/types/websocket-types';
import type { GameRoomResponse } from '@/types/api-types';
import { apiService } from '@/services/api.service';
import { useAuth } from '@/context/AuthContext';
import { syncManager } from '@/utils/SyncManager';

interface GameContextValue {
  sessionId: string | null;
  playerId: string | null;
  gameState: GameStateUpdate | null;
  isConnected: boolean;
  createRoom: (roomName: string, maxPlayers: number, mapId?: string) => Promise<GameRoomResponse>;
  joinRoom: (roomId: string, pid: string, username: string) => Promise<GameRoomResponse>;
  startGame: () => Promise<void>;
  onGameStart: (callback: () => void) => () => void;
  leaveRoom: () => Promise<void>;
  sendMove: (direction: PlayerMoveRequest['direction']) => void;
  placeBomb: (position: PlaceBombRequest['position']) => void;
  collectPowerUp: (powerUpId: string) => void;
  onBombExploded: (callback: (event: BombExplodedEvent) => void) => () => void;
  onPlayerKilled: (callback: (event: PlayerKilledEvent) => void) => () => void;
  onPowerUpCollected: (callback: (event: PowerUpCollectedEvent) => void) => () => void;
}

const GameContext = createContext<GameContextValue | null>(null);

// eslint-disable-next-line react-refresh/only-export-components
export const useGame = (): GameContextValue => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within GameProvider');
  }
  return context;
};

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [gameState, setGameState] = useState<GameStateUpdate | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [gameStartCallbacks] = useState<Set<() => void>>(new Set());

  const [bombExplodedCallbacks] = useState<Set<(event: BombExplodedEvent) => void>>(new Set());
  const [playerKilledCallbacks] = useState<Set<(event: PlayerKilledEvent) => void>>(new Set());
  const [powerUpCollectedCallbacks] = useState<Set<(event: PowerUpCollectedEvent) => void>>(
    new Set(),
  );

  const { accessToken } = useAuth();

  useEffect(() => {
    if (accessToken) {
      apiService.setAccessToken(accessToken);
    }
  }, [accessToken]);

  useEffect(() => {
    webSocketService
      .connect()
      .then(() => setIsConnected(true))
      .catch((error) => console.error('WebSocket connection failed:', error));

    return () => {
      webSocketService.disconnect();
    };
  }, []);

  const subscribeToSession = useCallback(
    (sid: string) => {
      console.log('🔌 Subscribing to session with NEW event-driven architecture:', sid);

      // Configure syncManager resync callback
      syncManager.setResyncCallback((state) => {
        console.log('🔄 SyncManager triggered resync, updating game state');
        setGameState(state);
        // Dispatch event for GameScene to handle
        window.dispatchEvent(new CustomEvent('force-resync', { detail: state }));
      });

      // ========================================================================
      // MAIN: Subscribe to full game state updates (CRITICAL FOR SYNC!)
      // ========================================================================

      // Subscribe to full state after each action
      webSocketService.subscribeToGameState(sid, (state: GameStateUpdate) => {
        console.log('📦 Full game state received, updating...');
        setGameState(state);
        // Dispatch to GameScene for rendering with dirty-checking
        window.dispatchEvent(new CustomEvent('game-state-update', { detail: state }));
      });

      // ========================================================================
      // EXISTING: Keep these for specific events
      // ========================================================================

      webSocketService.subscribeToBombExploded(sid, (event) => {
        bombExplodedCallbacks.forEach((cb) => cb(event));
      });

      webSocketService.subscribeToPlayerKilled(sid, (event) => {
        playerKilledCallbacks.forEach((cb) => cb(event));
      });

      webSocketService.subscribeToPowerUpCollected(sid, (event) => {
        powerUpCollectedCallbacks.forEach((cb) => cb(event));
      });

      webSocketService.subscribeToPlayerDisconnect(sid, (data) => {
        console.log('Player disconnected:', data.playerId);
      });

      webSocketService.subscribeToGameStart(sid, (notification) => {
        console.log('🎮 Game starting!', notification);
        setGameState(notification.initialState);
        gameStartCallbacks.forEach((cb) => cb());
      });

      // Periodically check heartbeat
      const heartbeatInterval = setInterval(() => {
        syncManager.checkHeartbeat(sid);
      }, 1000); // Check every second

      return () => {
        clearInterval(heartbeatInterval);
        syncManager.resetSession(sid);
      };
    },
    [bombExplodedCallbacks, gameStartCallbacks, playerKilledCallbacks, powerUpCollectedCallbacks],
  );

  const createRoom = useCallback(
    async (roomName: string, maxPlayers: number, mapId?: string): Promise<GameRoomResponse> => {
      const response = await gameApiService.createRoom({
        roomName,
        maxPlayers,
        mapId: mapId || 'default-map-001',
        isPrivate: false,
        password: null,
      });

      setSessionId(response.roomCode);
      subscribeToSession(response.roomCode);

      return response;
    },
    [subscribeToSession],
  );

  const joinRoom = useCallback(
    async (roomId: string, pid: string, username: string): Promise<GameRoomResponse> => {
      const response = await gameApiService.joinRoom({
        roomId,
        playerId: pid,
        username,
        password: null,
      });

      setSessionId(roomId);
      const serverPlayer = response.currentPlayers.find((p) => p.username === username);
      if (serverPlayer) {
        setPlayerId(serverPlayer.id);
      } else {
        setPlayerId(pid);
      }
      subscribeToSession(roomId);

      return response;
    },
    [subscribeToSession],
  );

  const startGame = useCallback(async () => {
    if (!sessionId || !playerId) return;
    await gameApiService.startGame(sessionId, playerId);
  }, [sessionId, playerId]);

  const onGameStart = useCallback(
    (callback: () => void): (() => void) => {
      gameStartCallbacks.add(callback);
      return () => {
        gameStartCallbacks.delete(callback);
      };
    },
    [gameStartCallbacks],
  );

  const leaveRoom = useCallback(async () => {
    if (sessionId && playerId) {
      await gameApiService.leaveRoom(sessionId, playerId);
      setSessionId(null);
      setPlayerId(null);
      setGameState(null);
    }
  }, [sessionId, playerId]);

  const sendMove = useCallback(
    (direction: PlayerMoveRequest['direction']) => {
      console.log('🎯 sendMove called:', { sessionId, playerId, direction });
      if (!sessionId || !playerId) return;

      console.log('📤 Calling webSocketService.sendPlayerMove');
      webSocketService.sendPlayerMove({
        sessionId,
        playerId,
        direction,
      });
    },
    [sessionId, playerId],
  );

  const placeBomb = useCallback(
    (position: PlaceBombRequest['position']) => {
      if (!sessionId || !playerId) return;

      webSocketService.sendPlaceBomb({
        sessionId,
        playerId,
        position,
      });
    },
    [sessionId, playerId],
  );

  const collectPowerUp = useCallback(
    (powerUpId: string) => {
      if (!sessionId || !playerId) return;

      webSocketService.sendPowerUpCollect({
        sessionId,
        playerId,
        powerUpId,
      });
    },
    [sessionId, playerId],
  );

  const onBombExploded = useCallback(
    (callback: (event: BombExplodedEvent) => void): (() => void) => {
      bombExplodedCallbacks.add(callback);
      return () => {
        bombExplodedCallbacks.delete(callback);
      };
    },
    [bombExplodedCallbacks],
  );

  const onPlayerKilled = useCallback(
    (callback: (event: PlayerKilledEvent) => void): (() => void) => {
      playerKilledCallbacks.add(callback);
      return () => {
        playerKilledCallbacks.delete(callback);
      };
    },
    [playerKilledCallbacks],
  );

  const onPowerUpCollected = useCallback(
    (callback: (event: PowerUpCollectedEvent) => void) => {
      powerUpCollectedCallbacks.add(callback);
      return () => powerUpCollectedCallbacks.delete(callback);
    },
    [powerUpCollectedCallbacks],
  );

  const value: GameContextValue = {
    sessionId,
    playerId,
    gameState,
    isConnected,
    createRoom,
    joinRoom,
    leaveRoom,
    sendMove,
    placeBomb,
    collectPowerUp,
    onBombExploded,
    onPlayerKilled,
    onPowerUpCollected,
    startGame,
    onGameStart,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};
