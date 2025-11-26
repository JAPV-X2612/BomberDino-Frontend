import { useEffect, useRef, type FC } from 'react';
import Phaser from 'phaser';
import { gameConfig } from '@/phaser/game.config';
import { GameScene } from '@/phaser/scenes/GameScene';
import { useGame } from '@/context/GameContext';
import type { PlayerMovedEvent, BombPlacedEvent, GameStateUpdate } from '@/types/websocket-types';
import './GameCanvas.css';

interface GameCanvasProps {
  sessionId: string;
  playerId: string;
}

export const GameCanvas: FC<GameCanvasProps> = ({ sessionId, playerId }) => {
  const gameRef = useRef<Phaser.Game | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<GameScene | null>(null);
  const { gameState, sendMove, placeBomb, collectPowerUp, onBombExploded, onPlayerKilled } =
    useGame();

  useEffect(() => {
    if (!containerRef.current || gameRef.current) return;

    const config: Phaser.Types.Core.GameConfig = {
      ...gameConfig,
      parent: containerRef.current,
    };

    gameRef.current = new Phaser.Game(config);

    gameRef.current.events.once('ready', () => {
      const scene = gameRef.current!.scene.getScene('GameScene') as GameScene;
      if (scene) {
        sceneRef.current = scene;
        scene.setSessionContext(sessionId, playerId);
        scene.setGameActions({
          sendMove,
          placeBomb,
          collectPowerUp,
        });

        // Escuchar cuando la escena esté completamente lista
        scene.events.once('scene-ready', () => {
          console.log('🎮 Scene ready event received, applying state');
          if (gameState) {
            scene.updateGameState(gameState);
          }
        });
      }
    });

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
        sceneRef.current = null;
      }
    };
  }, [sessionId, playerId, sendMove, placeBomb, collectPowerUp, gameState]);

  useEffect(() => {
    if (!sceneRef.current || !gameState) return;

    if (sceneRef.current.scene.isActive()) {
      console.log('🔄 Updating game state');
      sceneRef.current.updateGameState(gameState);
    }
  }, [gameState]);

  useEffect(() => {
    const unsubscribeBombExploded = onBombExploded((event) => {
      if (sceneRef.current?.scene.isActive()) {
        sceneRef.current.handleBombExploded(event);
      }
    });

    const unsubscribePlayerKilled = onPlayerKilled((event) => {
      if (sceneRef.current?.scene.isActive()) {
        sceneRef.current.handlePlayerKilled(event);
      }
    });

    return () => {
      unsubscribeBombExploded();
      unsubscribePlayerKilled();
    };
  }, [onBombExploded, onPlayerKilled]);

  // ============================================================================
  // NEW: Listen to event-driven updates from window events
  // ============================================================================
  useEffect(() => {
    const handlePlayerMoved = (event: CustomEvent<PlayerMovedEvent>) => {
      if (sceneRef.current?.scene.isActive()) {
        sceneRef.current.handlePlayerMovedEvent(event.detail);
      }
    };

    const handleBombPlaced = (event: CustomEvent<BombPlacedEvent>) => {
      if (sceneRef.current?.scene.isActive()) {
        sceneRef.current.handleBombPlacedEvent(event.detail);
      }
    };

    const handlePeriodicSync = (event: CustomEvent<GameStateUpdate>) => {
      if (sceneRef.current?.scene.isActive()) {
        sceneRef.current.handlePeriodicSync(event.detail);
      }
    };

    window.addEventListener('player-moved', handlePlayerMoved as EventListener);
    window.addEventListener('bomb-placed', handleBombPlaced as EventListener);
    window.addEventListener('periodic-sync', handlePeriodicSync as EventListener);

    return () => {
      window.removeEventListener('player-moved', handlePlayerMoved as EventListener);
      window.removeEventListener('bomb-placed', handleBombPlaced as EventListener);
      window.removeEventListener('periodic-sync', handlePeriodicSync as EventListener);
    };
  }, []);

  return <div ref={containerRef} className="game-canvas-container" />;
};
