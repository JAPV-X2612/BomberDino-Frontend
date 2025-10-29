import { useEffect, useRef, type FC } from 'react';
import Phaser from 'phaser';
import { gameConfig } from '@/phaser/game.config';
import { GameScene } from '@/phaser/scenes/GameScene';
import { useGame } from '@/context/GameContext';
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
      }
    });

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
        sceneRef.current = null;
      }
    };
  }, [sessionId, playerId, sendMove, placeBomb, collectPowerUp]);

  useEffect(() => {
    if (!sceneRef.current || !gameState) return;

    if (sceneRef.current.scene.isActive()) {
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

  return <div ref={containerRef} className="game-canvas-container" />;
};
