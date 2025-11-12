import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload(): void {
    this.load.image('player-blue', '/assets/images/avatars/dino-blue.png');
    this.load.image('player-green', '/assets/images/avatars/dino-green.png');
    this.load.image('player-orange', '/assets/images/avatars/dino-orange.png');
    this.load.image('player-purple', '/assets/images/avatars/dino-purple.png');

    this.createGameAssets();
  }

  create(): void {
    this.scene.start('GameScene');
  }

  private createGameAssets(): void {
    // Indestructible block (darker)
    const indestructible = this.add.graphics();
    indestructible.fillStyle(0x333333, 1);
    indestructible.fillRect(0, 0, 64, 64);
    indestructible.generateTexture('block-indestructible', 64, 64);
    indestructible.destroy();

    // Destructible block (lighter)
    const destructible = this.add.graphics();
    destructible.fillStyle(0x79b93f, 1);
    destructible.fillRect(0, 0, 64, 64);
    destructible.lineStyle(2, 0x006b4c);
    destructible.strokeRect(2, 2, 60, 60);
    destructible.generateTexture('block-destructible', 64, 64);
    destructible.destroy();

    // Bomb (egg shape)
    const bomb = this.add.graphics();
    bomb.fillStyle(0xffffff, 1);
    bomb.fillEllipse(32, 32, 40, 50);
    bomb.lineStyle(3, 0x000000);
    bomb.strokeEllipse(32, 32, 40, 50);
    bomb.generateTexture('bomb', 64, 64);
    bomb.destroy();

    // Explosion
    const explosion = this.add.graphics();
    explosion.fillStyle(0xff6600, 1);
    explosion.fillCircle(32, 32, 30);
    explosion.fillStyle(0xffaa00, 1);
    explosion.fillCircle(32, 32, 20);
    explosion.generateTexture('explosion', 64, 64);
    explosion.destroy();

    // Power-ups
    ['speed', 'explosion', 'bomb'].forEach((type, index) => {
      const colors = [0x38c2f1, 0xe57e29, 0x983f94];
      const powerup = this.add.graphics();
      powerup.fillStyle(colors[index], 1);
      powerup.fillCircle(32, 32, 20);
      powerup.lineStyle(3, 0xffffff);
      powerup.strokeCircle(32, 32, 20);
      powerup.generateTexture(`powerup-${type}`, 64, 64);
      powerup.destroy();
    });
  }
}
