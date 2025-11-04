import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { GameScene } from './scenes/GameScene';
import { GameOverScene } from './scenes/GameOverScene';

export const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 672, // 12 * 56
  height: 672, // 12 * 56
  backgroundColor: '#3e9e57',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false,
    },
  },
  scene: [BootScene, GameScene, GameOverScene],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 672,
    height: 672,
    min: {
      width: 672,
      height: 672,
    },
    max: {
      width: 1344, // 2x para pantallas grandes
      height: 1344,
    },
  },
  render: {
    pixelArt: true,
    antialias: false,
  },
};
