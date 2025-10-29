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
  const { gameState, sendMove, placeBomb, collectPowerUp, onBombExploded, onPlayerKilled } =
    useGame();

  useEffect(() => {
    if (!containerRef.current || gameRef.current) return;

    const config: Phaser.Types.Core.GameConfig = {
      ...gameConfig,
      parent: containerRef.current,
      scene: {
        ...(gameConfig.scene as Phaser.Types.Scenes.SettingsConfig),
        init: function () {
          const gameScene = this as unknown as GameScene;
          gameScene.setSessionContext(sessionId, playerId);
          gameScene.setGameActions({
            sendMove,
            placeBomb,
            collectPowerUp,
          });
        },
      },
    };

    gameRef.current = new Phaser.Game(config);

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, [sessionId, playerId, sendMove, placeBomb, collectPowerUp]);

  useEffect(() => {
    if (!gameRef.current || !gameState) return;

    const scene = gameRef.current.scene.getScene('GameScene') as GameScene;
    if (scene?.scene.isActive()) {
      scene.updateGameState(gameState);
    }
  }, [gameState]);

  useEffect(() => {
    const unsubscribeBombExploded = onBombExploded((event) => {
      const scene = gameRef.current?.scene.getScene('GameScene') as GameScene;
      if (scene?.scene.isActive()) {
        scene.handleBombExploded(event);
      }
    });

    const unsubscribePlayerKilled = onPlayerKilled((event) => {
      const scene = gameRef.current?.scene.getScene('GameScene') as GameScene;
      if (scene?.scene.isActive()) {
        scene.handlePlayerKilled(event);
      }
    });

    return () => {
      unsubscribeBombExploded();
      unsubscribePlayerKilled();
    };
  }, [onBombExploded, onPlayerKilled]);

  return <div ref={containerRef} className="game-canvas-container" />;
};
