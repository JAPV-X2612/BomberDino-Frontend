import Phaser from 'phaser';
import { Player } from '@/phaser/entities/Player';
import { Direction } from '@/types/websocket-types';
import type {
  GameStateUpdate,
  PlayerDTO,
  BombDTO,
  PowerUpDTO,
  BombExplodedEvent,
  PlayerKilledEvent,
  Point,
} from '@/types/websocket-types';

interface GameActions {
  sendMove: (direction: Direction) => void;
  placeBomb: (position: Point) => void;
  collectPowerUp: (powerUpId: string) => void;
}

export class GameScene extends Phaser.Scene {
  private readonly players: Map<string, Player> = new Map();
  private readonly bombs: Map<string, Phaser.GameObjects.Image> = new Map();
  private readonly powerUps: Map<string, Phaser.GameObjects.Image> = new Map();
  private blocks: Phaser.GameObjects.Group | null = null;

  private sessionId: string = '';
  private localPlayerId: string = '';
  private gameActions: GameActions | null = null;

  private readonly cellSize: number = 56;
  private readonly boardSize: number = 12;
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys | null = null;

  private canPlaceBomb: boolean = true;
  private readonly bombCooldown: number = 500;

  constructor() {
    super({ key: 'GameScene' });
  }

  setSessionContext(sessionId: string, playerId: string): void {
    this.sessionId = sessionId;
    this.localPlayerId = playerId;
  }

  setGameActions(actions: GameActions): void {
    this.gameActions = actions;
  }

  create(): void {
    this.createBoard();
    this.createBlocks();
    this.setupInput();
  }

  update(): void {
    this.handleLocalPlayerInput();
  }

  private createBoard(): void {
    const boardPixelSize = this.boardSize * this.cellSize;
    this.add.rectangle(
      boardPixelSize / 2,
      boardPixelSize / 2,
      boardPixelSize,
      boardPixelSize,
      0x87ceeb,
    );

    for (let row = 0; row < this.boardSize; row++) {
      for (let col = 0; col < this.boardSize; col++) {
        const x = col * this.cellSize + this.cellSize / 2;
        const y = row * this.cellSize + this.cellSize / 2;

        const cellColor = (row + col) % 2 === 0 ? 0x98d8c8 : 0x6ab388;
        this.add.rectangle(x, y, this.cellSize, this.cellSize, cellColor);
      }
    }
  }

  private createBlocks(): void {
    this.blocks = this.add.group();

    const indestructiblePositions = [
      { row: 0, col: 0 },
      { row: 0, col: 1 },
      { row: 1, col: 0 },
      { row: 0, col: this.boardSize - 1 },
      { row: 0, col: this.boardSize - 2 },
      { row: 1, col: this.boardSize - 1 },
      { row: this.boardSize - 1, col: 0 },
      { row: this.boardSize - 1, col: 1 },
      { row: this.boardSize - 2, col: 0 },
      { row: this.boardSize - 1, col: this.boardSize - 1 },
      { row: this.boardSize - 1, col: this.boardSize - 2 },
      { row: this.boardSize - 2, col: this.boardSize - 1 },
    ];

    for (let row = 1; row < this.boardSize - 1; row += 2) {
      for (let col = 1; col < this.boardSize - 1; col += 2) {
        const x = col * this.cellSize + this.cellSize / 2;
        const y = row * this.cellSize + this.cellSize / 2;

        const block = this.add.image(x, y, 'block-indestructible');
        block.setDisplaySize(this.cellSize, this.cellSize);
        block.setData('blockType', 'indestructible');
        block.setData('gridX', col);
        block.setData('gridY', row);
        this.blocks.add(block);
      }
    }

    const occupiedCells = new Set(indestructiblePositions.map((pos) => `${pos.row},${pos.col}`));

    for (let row = 1; row < this.boardSize - 1; row += 2) {
      for (let col = 1; col < this.boardSize - 1; col += 2) {
        occupiedCells.add(`${row},${col}`);
      }
    }

    const destructibleCount = 30;
    let placed = 0;

    while (placed < destructibleCount) {
      const row = Phaser.Math.Between(1, this.boardSize - 2);
      const col = Phaser.Math.Between(1, this.boardSize - 2);
      const key = `${row},${col}`;

      if (!occupiedCells.has(key)) {
        occupiedCells.add(key);
        const x = col * this.cellSize + this.cellSize / 2;
        const y = row * this.cellSize + this.cellSize / 2;

        const block = this.add.image(x, y, 'block-destructible');
        block.setDisplaySize(this.cellSize, this.cellSize);
        block.setData('blockType', 'destructible');
        block.setData('gridX', col);
        block.setData('gridY', row);
        this.blocks.add(block);

        placed++;
      }
    }
  }

  private setupInput(): void {
    this.cursors = this.input.keyboard?.createCursorKeys() || null;

    this.input.keyboard?.on('keydown-SPACE', () => {
      this.handleBombPlacement();
    });
  }

  private handleLocalPlayerInput(): void {
    if (!this.cursors || !this.gameActions) return;

    const localPlayer = this.players.get(this.localPlayerId);
    if (!localPlayer || !localPlayer.isAlive()) return;

    if (Phaser.Input.Keyboard.JustDown(this.cursors.up!)) {
      this.gameActions.sendMove(Direction.UP);
    } else if (Phaser.Input.Keyboard.JustDown(this.cursors.down!)) {
      this.gameActions.sendMove(Direction.DOWN);
    } else if (Phaser.Input.Keyboard.JustDown(this.cursors.left!)) {
      this.gameActions.sendMove(Direction.LEFT);
    } else if (Phaser.Input.Keyboard.JustDown(this.cursors.right!)) {
      this.gameActions.sendMove(Direction.RIGHT);
    }
  }

  private handleBombPlacement(): void {
    if (!this.canPlaceBomb || !this.gameActions) return;

    const localPlayer = this.players.get(this.localPlayerId);
    if (!localPlayer || !localPlayer.isAlive()) return;

    const sprite = localPlayer.getSprite();
    const gridX = Math.round(sprite.x / this.cellSize);
    const gridY = Math.round(sprite.y / this.cellSize);

    this.gameActions.placeBomb({ x: gridX, y: gridY });

    this.canPlaceBomb = false;
    this.time.delayedCall(this.bombCooldown, () => {
      this.canPlaceBomb = true;
    });
  }

  public updateGameState(state: GameStateUpdate): void {
    this.updatePlayers(state.players);
    this.updateBombs(state.bombs);
    this.updatePowerUps(state.powerUps);
  }

  private updatePlayers(playerDTOs: PlayerDTO[]): void {
    const currentPlayerIds = new Set(playerDTOs.map((p) => p.id));

    this.players.forEach((player, id) => {
      if (!currentPlayerIds.has(id)) {
        player.getSprite().destroy();
        this.players.delete(id);
      }
    });

    playerDTOs.forEach((dto, index) => {
      let player = this.players.get(dto.id);

      if (!player) {
        const colors = ['blue', 'green', 'orange', 'purple'];
        const color = colors[index % colors.length];
        const texture = `player-${color}`;

        const pixelX = dto.posX * this.cellSize + this.cellSize / 2;
        const pixelY = dto.posY * this.cellSize + this.cellSize / 2;

        player = new Player(this, pixelX, pixelY, texture, dto.id, this.cellSize);
        this.players.set(dto.id, player);
      }

      const sprite = player.getSprite();
      const targetX = dto.posX * this.cellSize + this.cellSize / 2;
      const targetY = dto.posY * this.cellSize + this.cellSize / 2;

      if (sprite.x !== targetX || sprite.y !== targetY) {
        this.tweens.add({
          targets: sprite,
          x: targetX,
          y: targetY,
          duration: 150,
          ease: 'Linear',
        });
      }

      if (dto.status !== 'ALIVE' && player.isAlive()) {
        player.takeDamage();
      }
    });
  }

  private updateBombs(bombDTOs: BombDTO[]): void {
    const currentBombIds = new Set(bombDTOs.map((b) => b.id));

    this.bombs.forEach((bombSprite, id) => {
      if (!currentBombIds.has(id)) {
        bombSprite.destroy();
        this.bombs.delete(id);
      }
    });

    bombDTOs.forEach((dto) => {
      if (!this.bombs.has(dto.id)) {
        const x = dto.posX * this.cellSize + this.cellSize / 2;
        const y = dto.posY * this.cellSize + this.cellSize / 2;

        const bomb = this.add.image(x, y, 'bomb');
        bomb.setDisplaySize(this.cellSize * 0.7, this.cellSize * 0.7);

        this.tweens.add({
          targets: bomb,
          scaleX: 1.1,
          scaleY: 1.1,
          duration: 300,
          yoyo: true,
          repeat: -1,
        });

        this.bombs.set(dto.id, bomb);
      }
    });
  }

  private updatePowerUps(powerUpDTOs: PowerUpDTO[]): void {
    const currentPowerUpIds = new Set(powerUpDTOs.map((p) => p.id));

    this.powerUps.forEach((powerUpSprite, id) => {
      if (!currentPowerUpIds.has(id)) {
        powerUpSprite.destroy();
        this.powerUps.delete(id);
      }
    });

    powerUpDTOs.forEach((dto) => {
      if (!this.powerUps.has(dto.id)) {
        const x = dto.posX * this.cellSize + this.cellSize / 2;
        const y = dto.posY * this.cellSize + this.cellSize / 2;

        const typeMap: { [key: string]: string } = {
          SPEED_UP: 'speed',
          BOMB_RANGE_UP: 'explosion',
          BOMB_COUNT_UP: 'bomb',
        };

        const textureType = typeMap[dto.type] || 'speed';
        const powerUp = this.add.image(x, y, `powerup-${textureType}`);
        powerUp.setDisplaySize(this.cellSize * 0.6, this.cellSize * 0.6);

        this.tweens.add({
          targets: powerUp,
          y: y - 10,
          duration: 800,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut',
        });

        this.powerUps.set(dto.id, powerUp);
      }
    });
  }

  public handleBombExploded(event: BombExplodedEvent): void {
    const bomb = this.bombs.get(event.bombId);
    if (bomb) {
      bomb.destroy();
      this.bombs.delete(event.bombId);
    }

    event.affectedTiles.forEach((tile) => {
      const x = tile.x * this.cellSize + this.cellSize / 2;
      const y = tile.y * this.cellSize + this.cellSize / 2;

      const explosion = this.add.image(x, y, 'explosion');
      explosion.setDisplaySize(this.cellSize, this.cellSize);
      explosion.setAlpha(0.8);

      this.tweens.add({
        targets: explosion,
        scaleX: 1.5,
        scaleY: 1.5,
        alpha: 0,
        duration: 500,
        onComplete: () => explosion.destroy(),
      });
    });

    if (this.blocks) {
      event.affectedTiles.forEach((tile) => {
        this.blocks!.getChildren().forEach((child) => {
          const block = child as Phaser.GameObjects.Image;
          const gridX = block.getData('gridX');
          const gridY = block.getData('gridY');

          if (
            gridX === tile.x &&
            gridY === tile.y &&
            block.getData('blockType') === 'destructible'
          ) {
            this.tweens.add({
              targets: block,
              alpha: 0,
              scaleX: 0,
              scaleY: 0,
              duration: 300,
              onComplete: () => block.destroy(),
            });
          }
        });
      });
    }
  }

  public handlePlayerKilled(event: PlayerKilledEvent): void {
    const player = this.players.get(event.victimId);
    if (player) {
      player.takeDamage();
    }

    const alivePlayers = Array.from(this.players.values()).filter((p) => p.isAlive());
    if (alivePlayers.length === 1) {
      this.time.delayedCall(2000, () => {
        this.scene.start('GameOverScene', { winner: alivePlayers[0].getPlayerId() });
      });
    }
  }
}
