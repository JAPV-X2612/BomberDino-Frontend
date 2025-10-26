import Phaser from 'phaser';

export class Player {
  private scene: Phaser.Scene;
  private sprite: Phaser.Physics.Arcade.Sprite;
  private playerId: string;
  private lives: number = 3;
  private cellSize: number;
  private isMoving: boolean = false;
  private spawnX: number;
  private spawnY: number;
  private isInvulnerable: boolean = false;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    texture: string,
    playerId: string,
    cellSize: number = 56
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

    if (Phaser.Input.Keyboard.JustDown(cursors.left!)) {
      targetX -= this.cellSize;
    } else if (Phaser.Input.Keyboard.JustDown(cursors.right!)) {
      targetX += this.cellSize;
    } else if (Phaser.Input.Keyboard.JustDown(cursors.up!)) {
      targetY -= this.cellSize;
    } else if (Phaser.Input.Keyboard.JustDown(cursors.down!)) {
      targetY += this.cellSize;
    } else {
      return;
    }

    // Verificar si la posición objetivo es válida
    if (this.canMoveTo(targetX, targetY)) {
      this.moveToCell(targetX, targetY);
    }
  }

  private canMoveTo(x: number, y: number): boolean {
    // Verificar límites del tablero (12x12)
    const boardSize = 12 * this.cellSize;
    if (x < this.cellSize / 2 || x > boardSize - this.cellSize / 2) return false;
    if (y < this.cellSize / 2 || y > boardSize - this.cellSize / 2) return false;

    // Verificar colisión con bloques
    const gridX = Math.round(x / this.cellSize);
    const gridY = Math.round(y / this.cellSize);
    
    // Obtener todos los bloques de la escena
    const blocks = this.scene.children.list.filter((obj: any) => 
      obj.getData && (obj.getData('blockType') === 'indestructible' || obj.getData('blockType') === 'destructible')
    );

    // Verificar si hay un bloque en la posición objetivo
    for (const block of blocks) {
      const blockGridX = Math.round((block as any).x / this.cellSize);
      const blockGridY = Math.round((block as any).y / this.cellSize);
      
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
      }
    });
  }

  takeDamage(): void {
    if (this.isInvulnerable || !this.isAlive()) return;

    this.lives--;
    
    // Emitir evento para actualizar HUD en React
    window.dispatchEvent(new CustomEvent('player-damage', {
      detail: { playerId: this.playerId, lives: this.lives }
    }));
    
    if (this.lives > 0) {
      // Respawn en posición inicial
      this.respawn();
    } else {
      // Muerte definitiva
      this.sprite.setVisible(false);
      this.sprite.setActive(false);
    }
  }

  private respawn(): void {
    // Hacer invulnerable temporalmente
    this.isInvulnerable = true;
    
    // Mover a posición inicial
    this.sprite.setPosition(this.spawnX, this.spawnY);
    
    // Efecto de parpadeo
    this.scene.tweens.add({
      targets: this.sprite,
      alpha: { from: 0.3, to: 1 },
      duration: 200,
      yoyo: true,
      repeat: 5,
      onComplete: () => {
        this.sprite.setAlpha(1);
        this.isInvulnerable = false;
      }
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
    return {
      x: Math.floor(this.sprite.x / this.cellSize),
      y: Math.floor(this.sprite.y / this.cellSize)
    };
  }
}