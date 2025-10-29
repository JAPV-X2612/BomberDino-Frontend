import { useEffect, useRef, type FC } from 'react';
import Phaser from 'phaser';
import { gameConfig } from '@/phaser/game.config';
import './GameCanvas.css';

export const GameCanvas: FC = () => {
  const gameRef = useRef<Phaser.Game | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || gameRef.current) return;

    gameRef.current = new Phaser.Game({
      ...gameConfig,
      parent: containerRef.current,
    });

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, []);

  return <div ref={containerRef} className="game-canvas" />;
};
