import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { gameConfig } from '@phaser/game.config';
import './GameCanvas.css';

export const GameCanvas: React.FC = () => {
  const gameRef = useRef<Phaser.Game | null>(null);
  const parentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (parentRef.current && !gameRef.current) {
      gameRef.current = new Phaser.Game({
        ...gameConfig,
        parent: parentRef.current,
      });
    }

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, []);

  return <div ref={parentRef} className="game-canvas" />;
};
