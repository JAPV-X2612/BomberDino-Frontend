import Phaser from 'phaser';

export class Player {
  private readonly scene: Phaser.Scene;
  private readonly sprite: Phaser.Physics.Arcade.Sprite;
  private readonly playerId: string;
  private lives: number = 3;
  private readonly cellSize: number;
  private readonly spawnX: number;
  private readonly spawnY: number;
  private isInvulnerable: boolean = false;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    texture: string,
    playerId: string,
    cellSize: number = 56,
  ) {
    this.scene = scene;
    this.playerId = playerId;
    this.cellSize = cellSize;
    this.spawnX = x;
    this.spawnY = y;

    this.sprite = scene.physics.add.sprite(x, y, texture);
    this.sprite.setDisplaySize(this.cellSize * 0.8, this.cellSize * 0.8);
    this.sprite.setCollideWorldBounds(true);
  }

  takeDamage(): void {
    if (this.isInvulnerable || !this.isAlive()) return;

    this.lives--;

    window.dispatchEvent(
      new CustomEvent('player-damage', {
        detail: { playerId: this.playerId, lives: this.lives },
      }),
    );

    if (this.lives > 0) {
      this.respawn();
    } else {
      this.sprite.setVisible(false);
      this.sprite.setActive(false);
    }
  }

  private respawn(): void {
    this.isInvulnerable = true;
    this.sprite.setPosition(this.spawnX, this.spawnY);

    this.scene.tweens.add({
      targets: this.sprite,
      alpha: { from: 0.3, to: 1 },
      duration: 200,
      yoyo: true,
      repeat: 5,
      onComplete: () => {
        this.sprite.setAlpha(1);
        this.isInvulnerable = false;
      },
    });
  }

  isAlive(): boolean {
    return this.lives > 0;
  }

  getSprite(): Phaser.Physics.Arcade.Sprite {
    return this.sprite;
  }

  getPlayerId(): string {
    return this.playerId;
  }

  getLives(): number {
    return this.lives;
  }
}
