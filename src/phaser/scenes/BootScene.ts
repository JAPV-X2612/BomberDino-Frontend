import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload(): void {
    console.log('BootScene: Starting preload...');
    this.createGameAssets();
    this.load.on('loaderror', (file: Phaser.Loader.File) => {
      console.error('Error loading file:', file.key, file.src);
    });

    this.load.image('player-blue', '/assets/images/avatars/dino-blue.png');
    this.load.image('player-green', '/assets/images/avatars/dino-green.png');
    this.load.image('player-orange', '/assets/images/avatars/dino-orange.png');
    this.load.image('player-purple', '/assets/images/avatars/dino-purple.png');
  }

  create(): void {
    console.log('BootScene: Create called, starting GameScene...');

    const colors = ['blue', 'green', 'orange', 'purple'];
    const colorHex = [0x0000ff, 0x00ff00, 0xff8800, 0x8800ff];

    colors.forEach((color, index) => {
      const key = `player-${color}`;
      if (!this.textures.exists(key)) {
        console.warn(`Texture ${key} not found, creating placeholder`);
        this.createPlayerPlaceholder(key, colorHex[index]);
      }
    });

    this.scene.start('GameScene');
  }

  private createPlayerPlaceholder(key: string, color: number): void {
    const graphics = this.add.graphics();
    graphics.fillStyle(color, 1);
    graphics.fillCircle(32, 32, 28);
    graphics.fillStyle(0xffffff, 1);
    graphics.fillCircle(24, 24, 8);
    graphics.fillCircle(40, 24, 8);
    graphics.fillStyle(0x000000, 1);
    graphics.fillCircle(24, 24, 4);
    graphics.fillCircle(40, 24, 4);
    graphics.generateTexture(key, 64, 64);
    graphics.destroy();
  }

  private createGameAssets(): void {
    console.log('Creating game assets...');

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

    console.log('Game assets created successfully');
  }
}
