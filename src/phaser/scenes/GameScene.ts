import Phaser from 'phaser';
import { Player } from '@/phaser/entities/Player';

export class GameScene extends Phaser.Scene {
  private players: Player[] = [];
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private readonly cellSize: number = 56;
  private readonly boardSize: number = 12;

  constructor() {
    super({ key: 'GameScene' });
  }

  create(): void {
    this.createBoard();
    this.createBlocks();
    this.createPlayers();
    this.setupInput();
  }

  private createBoard(): void {
    const boardPixelSize = this.boardSize * this.cellSize;

    for (let row = 0; row < this.boardSize; row++) {
      for (let col = 0; col < this.boardSize; col++) {
        const x = col * this.cellSize + this.cellSize / 2;
        const y = row * this.cellSize + this.cellSize / 2;
        const cellColor = (row + col) % 2 === 0 ? 0x79b93f : 0x6ba83a;

        this.add.rectangle(x, y, this.cellSize, this.cellSize, cellColor);
      }
    }
  }

  private createBlocks(): void {
    const layout = [
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0],
      [0, 0, 2, 2, 2, 2, 2, 2, 0, 0, 0, 0],
      [0, 1, 2, 1, 2, 1, 0, 1, 2, 1, 0, 0],
      [0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 0],
      [0, 1, 2, 1, 2, 1, 2, 1, 0, 1, 0, 0],
      [0, 0, 0, 2, 2, 2, 2, 2, 2, 2, 0, 0],
      [0, 1, 0, 1, 2, 1, 0, 1, 0, 1, 2, 0],
      [0, 2, 0, 2, 2, 2, 0, 2, 0, 2, 0, 0],
      [0, 1, 0, 1, 2, 1, 2, 1, 0, 1, 2, 0],
      [0, 0, 0, 0, 0, 2, 2, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    ];

    for (let row = 0; row < this.boardSize; row++) {
      for (let col = 0; col < this.boardSize; col++) {
        const blockType = layout[row][col];
        const x = col * this.cellSize + this.cellSize / 2;
        const y = row * this.cellSize + this.cellSize / 2;

        if (blockType === 1) {
          const block = this.add.image(x, y, 'block-indestructible');
          block.setDisplaySize(this.cellSize, this.cellSize);
          block.setData('blockType', 'indestructible');
        } else if (blockType === 2) {
          const block = this.add.image(x, y, 'block-destructible');
          block.setDisplaySize(this.cellSize, this.cellSize);
          block.setData('blockType', 'destructible');
        }
      }
    }
  }

  private createPlayers(): void {
    const playerConfigs = [
      { x: 0, y: 0, texture: 'player-blue', id: 'player-0' },
      { x: 11, y: 0, texture: 'player-green', id: 'player-1' },
      { x: 0, y: 11, texture: 'player-orange', id: 'player-2' },
      { x: 11, y: 11, texture: 'player-purple', id: 'player-3' },
    ];

    playerConfigs.forEach((config) => {
      const pixelX = config.x * this.cellSize + this.cellSize / 2;
      const pixelY = config.y * this.cellSize + this.cellSize / 2;

      const player = new Player(this, pixelX, pixelY, config.texture, config.id, this.cellSize);
      this.players.push(player);
    });
  }

  private setupInput(): void {
    this.cursors = this.input.keyboard!.createCursorKeys();
  }

  update(): void {
    if (this.players.length > 0) {
      this.players[0].handleInput(this.cursors);
    }
  }
}
