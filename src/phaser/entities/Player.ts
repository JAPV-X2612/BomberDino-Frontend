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

  // Para movimiento por casillas
  private isMoving: boolean = false;
  private gridX: number;
  private gridY: number;

  private targetX: number = 0; // ⬅️ AGREGAR
  private targetY: number = 0;

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

    // Calcular posición inicial en la cuadrícula
    this.gridX = Math.floor(x / cellSize);
    this.gridY = Math.floor(y / cellSize);

    this.sprite = scene.physics.add.sprite(x, y, texture);
    this.sprite.setDisplaySize(this.cellSize * 0.7, this.cellSize * 0.7);
    this.sprite.setCollideWorldBounds(true);
    this.sprite.setDepth(30);

    this.targetX = x;
    this.targetY = y;

    // Desactivar velocidad - ahora usamos tweens para mover
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    if (body) {
      body.setVelocity(0, 0);
    }
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

  setLives(lives: number): void {
    this.lives = lives;
  }

  private respawn(): void {
    this.isInvulnerable = true;
    this.sprite.setPosition(this.spawnX, this.spawnY);
    this.gridX = Math.floor(this.spawnX / this.cellSize);
    this.gridY = Math.floor(this.spawnY / this.cellSize);

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

  getGridPosition(): { x: number; y: number } {
    return { x: this.gridX, y: this.gridY };
  }

  // Nuevo método para mover por casillas
  moveToCell(newGridX: number, newGridY: number, boardSize: number): boolean {
    if (newGridX < 0 || newGridX >= boardSize || newGridY < 0 || newGridY >= boardSize) {
      return false;
    }

    this.targetX = newGridX * this.cellSize + this.cellSize / 2;
    this.targetY = newGridY * this.cellSize + this.cellSize / 2;
    this.gridX = newGridX;
    this.gridY = newGridY;

    return true;
  }

  canMove(): boolean {
    return !this.isMoving;
  }
}
