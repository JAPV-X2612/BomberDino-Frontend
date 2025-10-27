import Phaser from 'phaser';

export class Player {
  private readonly scene: Phaser.Scene;
  private readonly sprite: Phaser.Physics.Arcade.Sprite;
  private readonly playerId: string;
  private lives: number = 3;
  private readonly cellSize: number;
  private isMoving: boolean = false;
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
    this.sprite.setCollideWorldBounds(true);
  }

  handleInput(cursors: Phaser.Types.Input.Keyboard.CursorKeys): void {
    if (this.isMoving || !this.isAlive()) return;

    let targetX = this.sprite.x;
    let targetY = this.sprite.y;

    if (Phaser.Input.Keyboard.JustDown(cursors.left)) {
      targetX -= this.cellSize;
    } else if (Phaser.Input.Keyboard.JustDown(cursors.right)) {
      targetX += this.cellSize;
    } else if (Phaser.Input.Keyboard.JustDown(cursors.up)) {
      targetY -= this.cellSize;
    } else if (Phaser.Input.Keyboard.JustDown(cursors.down)) {
      targetY += this.cellSize;
    } else {
      return;
    }

    if (this.canMoveTo(targetX, targetY)) {
      this.moveToCell(targetX, targetY);
    }
  }

  private canMoveTo(x: number, y: number): boolean {
    const boardSize = 12 * this.cellSize;
    if (x < this.cellSize / 2 || x > boardSize - this.cellSize / 2) return false;
    if (y < this.cellSize / 2 || y > boardSize - this.cellSize / 2) return false;

    const gridX = Math.round(x / this.cellSize);
    const gridY = Math.round(y / this.cellSize);

    const blocks = this.scene.children.list.filter((obj) => {
      const gameObj = obj as Phaser.GameObjects.Rectangle & {
        getData?: (key: string) => string;
      };
      return (
        gameObj.getData &&
        (gameObj.getData('blockType') === 'indestructible' ||
          gameObj.getData('blockType') === 'destructible')
      );
    });

    for (const block of blocks) {
      const b = block as Phaser.GameObjects.Rectangle;
      const blockGridX = Math.round(b.x / this.cellSize);
      const blockGridY = Math.round(b.y / this.cellSize);

      if (blockGridX === gridX && blockGridY === gridY) {
        return false;
      }
    }

    return true;
  }

  private moveToCell(targetX: number, targetY: number): void {
    this.isMoving = true;

    this.scene.tweens.add({
      targets: this.sprite,
      x: targetX,
      y: targetY,
      duration: 150,
      ease: 'Linear',
      onComplete: () => {
        this.isMoving = false;
      },
    });
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
}
