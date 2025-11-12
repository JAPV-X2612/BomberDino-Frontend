import Phaser from 'phaser';
import { Player } from '@phaser/entities/Player';

export class GameScene extends Phaser.Scene {
  private readonly players: Map<string, Player> = new Map();
  private bombs!: Phaser.GameObjects.Group;
  private blocks!: Phaser.GameObjects.Group;
  private indestructibleBlocks!: Phaser.GameObjects.Group;
  private powerups!: Phaser.GameObjects.Group;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private spaceKey!: Phaser.Input.Keyboard.Key;

  private readonly CELL_SIZE = 56;
  private readonly BOARD_SIZE = 12;

  constructor() {
    super({ key: 'GameScene' });
  }

  create(): void {
    console.log('GameScene: Create called');

    const boardWidth = this.BOARD_SIZE * this.CELL_SIZE;
    const boardHeight = this.BOARD_SIZE * this.CELL_SIZE;

    // Configurar el mundo de física
    this.physics.world.setBounds(0, 0, boardWidth, boardHeight);

    // Configurar la cámara para que cubra todo el tablero
    this.cameras.main.setBounds(0, 0, boardWidth, boardHeight);
    this.cameras.main.setZoom(1);

    this.createBoard();
    this.createPlayers();
    this.setupInput();
    this.setupGroups();
    this.startPowerupSpawner();

    console.log('GameScene: Setup complete');
  }

  private createBoard(): void {
    const boardWidth = this.BOARD_SIZE * this.CELL_SIZE;
    const boardHeight = this.BOARD_SIZE * this.CELL_SIZE;

    this.add.rectangle(
        boardWidth / 2,
        boardHeight / 2,
        boardWidth,
        boardHeight,
        0x3e9e57,
    );

    for (let i = 0; i <= this.BOARD_SIZE; i++) {
      this.add
          .line(0, 0, i * this.CELL_SIZE, 0, i * this.CELL_SIZE, boardHeight, 0x000000, 0.3)
          .setOrigin(0);

      this.add
          .line(0, 0, 0, i * this.CELL_SIZE, boardWidth, i * this.CELL_SIZE, 0x000000, 0.3)
          .setOrigin(0);
    }

    this.indestructibleBlocks = this.add.group();
    this.blocks = this.add.group();

    for (let row = 0; row < this.BOARD_SIZE; row++) {
      for (let col = 0; col < this.BOARD_SIZE; col++) {
        const isTopLeftCorner = row < 2 && col < 2;
        const isTopRightCorner = row < 2 && col >= this.BOARD_SIZE - 2;
        const isBottomLeftCorner = row >= this.BOARD_SIZE - 2 && col < 2;
        const isBottomRightCorner =
            row >= this.BOARD_SIZE - 2 && col >= this.BOARD_SIZE - 2;
        const isCorner =
            isTopLeftCorner ||
            isTopRightCorner ||
            isBottomLeftCorner ||
            isBottomRightCorner;

        if (row % 2 === 1 && col % 2 === 1 && !isCorner) {
          const block = this.add.rectangle(
              col * this.CELL_SIZE + this.CELL_SIZE / 2,
              row * this.CELL_SIZE + this.CELL_SIZE / 2,
              this.CELL_SIZE * 0.9,
              this.CELL_SIZE * 0.9,
              0x4a4a4a,
          );
          block.setData('blockType', 'indestructible');
          this.physics.add.existing(block, true);
          this.indestructibleBlocks.add(block);
        }

        else if (!isCorner && Math.random() < 0.6) {
          const block = this.add.rectangle(
              col * this.CELL_SIZE + this.CELL_SIZE / 2,
              row * this.CELL_SIZE + this.CELL_SIZE / 2,
              this.CELL_SIZE * 0.85,
              this.CELL_SIZE * 0.85,
              0xa0826d,
          );
          block.setData('blockType', 'destructible');
          block.setData('gridX', col);
          block.setData('gridY', row);
          this.physics.add.existing(block, true);
          this.blocks.add(block);
        }
      }
    }
  }

  private createPlayers(): void {
    const positions = [
      { x: 0, y: 0, color: 'blue' }, // Top-left
      { x: this.BOARD_SIZE - 1, y: 0, color: 'green' }, // Top-right
      { x: 0, y: this.BOARD_SIZE - 1, color: 'orange' }, // Bottom-left
      { x: this.BOARD_SIZE - 1, y: this.BOARD_SIZE - 1, color: 'purple' }, // Bottom-right
    ];

    positions.forEach((pos, index) => {
      const player = new Player(
          this,
          pos.x * this.CELL_SIZE + this.CELL_SIZE / 2,
          pos.y * this.CELL_SIZE + this.CELL_SIZE / 2,
          `player-${pos.color}`,
          `player-${index}`,
          this.CELL_SIZE,
      );

      const sprite = player.getSprite();
      sprite.setScale(0.3);
      sprite.setDisplaySize(this.CELL_SIZE * 0.7, this.CELL_SIZE * 0.7);

      this.players.set(`player-${index}`, player);
    });

      this.physics.add.collider(sprite, this.blocks);
      this.physics.add.collider(sprite, this.indestructibleBlocks);
    });
  }

  private setupInput(): void {
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.spaceKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    console.log('Cursors and space key set up', this.cursors, this.spaceKey);
  }

  private setupGroups(): void {
    this.bombs = this.add.group();
    this.powerups = this.add.group();
  }

  update(): void {
    const localPlayer = this.players.get('player-0');
    if (localPlayer) {
      // localPlayer.handleInput(this.cursors);

      if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
        this.placeBomb(localPlayer);
      }
    }
  }

  private placeBomb(player: Player): void {
    const pos = player.getGridPosition();

    if (this.hasBombAt(pos.x, pos.y)) {
      return;
    }

    const bombX = pos.x * this.CELL_SIZE + this.CELL_SIZE / 2;
    const bombY = pos.y * this.CELL_SIZE + this.CELL_SIZE / 2;

    const bomb = this.add.container(bombX, bombY);
    bomb.setData('gridX', pos.x);
    bomb.setData('gridY', pos.y);

    const eggBody = this.add.ellipse(
        0,
        0,
        this.CELL_SIZE * 0.6,
        this.CELL_SIZE * 0.75,
        0xffe4b5,
    );
    const eggShine = this.add.ellipse(
        -5,
        -8,
        this.CELL_SIZE * 0.2,
        this.CELL_SIZE * 0.25,
        0xffffff,
        0.6,
    );

    const spot1 = this.add.circle(4, -5, this.CELL_SIZE * 0.08, 0xd2691e, 0.5);
    const spot2 = this.add.circle(-6, 3, this.CELL_SIZE * 0.06, 0xd2691e, 0.5);

    const fuse = this.add.rectangle(
        0,
        -this.CELL_SIZE * 0.45,
        2,
        this.CELL_SIZE * 0.2,
        0x8b4513,
    );
    const spark = this.add.circle(0, -this.CELL_SIZE * 0.5, 3, 0xff4500);

    bomb.add([eggBody, eggShine, spot1, spot2, fuse, spark]);
    this.bombs.add(bomb);

    this.tweens.add({
      targets: spark,
      alpha: { from: 1, to: 0.3 },
      scale: { from: 1, to: 1.3 },
      duration: 300,
      yoyo: true,
      repeat: -1,
    });

    this.tweens.add({
      targets: bomb,
      angle: { from: -5, to: 5 },
      duration: 200,
      yoyo: true,
      repeat: -1,
    });

    this.time.delayedCall(3000, () => {
      this.explodeBomb(bomb, pos.x, pos.y);
    });
  }

  private explodeBomb(bomb: Phaser.GameObjects.Container, gridX: number, gridY: number): void {
    const explosionCenter = this.add.circle(bomb.x, bomb.y, this.CELL_SIZE * 0.8, 0xff4500);
    const explosionOuter = this.add.circle(bomb.x, bomb.y, this.CELL_SIZE * 0.5, 0xffd700);

    this.tweens.add({
      targets: [explosionCenter, explosionOuter],
      scale: { from: 0.3, to: 2 },
      alpha: { from: 1, to: 0 },
      duration: 400,
      onComplete: () => {
        explosionCenter.destroy();
        explosionOuter.destroy();
      },
    });

    bomb.destroy();

    const range = 1;
    const directions = [
      { dx: 0, dy: 0 },
      { dx: 1, dy: 0 },
      { dx: -1, dy: 0 },
      { dx: 0, dy: 1 },
      { dx: 0, dy: -1 },
    ];

    directions.forEach(({ dx, dy }) => {
      for (let i = 0; i <= range; i++) {
        const targetX = gridX + dx * i;
        const targetY = gridY + dy * i;

        if (
            targetX < 0 ||
            targetX >= this.BOARD_SIZE ||
            targetY < 0 ||
            targetY >= this.BOARD_SIZE
        ) {
          break;
        }

        const cellX = targetX * this.CELL_SIZE + this.CELL_SIZE / 2;
        const cellY = targetY * this.CELL_SIZE + this.CELL_SIZE / 2;

        // Efecto visual
        if (i > 0) {
          const flame = this.add.circle(cellX, cellY, this.CELL_SIZE * 0.4, 0xff6600);
          this.tweens.add({
            targets: flame,
            scale: { from: 0.5, to: 1.5 },
            alpha: { from: 1, to: 0 },
            duration: 300,
            onComplete: () => flame.destroy(),
          });
        }

        let blockDestroyed = false;
        this.blocks.getChildren().forEach((block) => {
          const b = block as Phaser.GameObjects.Rectangle;
          if (b.getData('gridX') === targetX && b.getData('gridY') === targetY) {
            this.tweens.add({
              targets: block,
              alpha: 0,
              scale: 0,
              duration: 200,
              onComplete: () => block.destroy(),
            });
            blockDestroyed = true;
          }
        });

        if (blockDestroyed) break;

        if (this.hasBlockAt(targetX, targetY)) break;

        this.players.forEach((player) => {
          const playerPos = player.getGridPosition();
          if (playerPos.x === targetX && playerPos.y === targetY) {
            player.takeDamage();
            if (!player.isAlive()) {
              this.checkGameOver();
            }
          }
        });
      }
    });
  }

  private checkGameOver(): void {
    const alivePlayers = Array.from(this.players.values()).filter((p) => p.isAlive());

    if (alivePlayers.length <= 1) {
      const winner = alivePlayers[0];
      const allPlayerIds = Array.from(this.players.keys());
      this.scene.start('GameOverScene', {
        winner: winner?.getPlayerId(),
        players: allPlayerIds,
      });
    }
  }

  private startPowerupSpawner(): void {
    this.time.addEvent({
      delay: Phaser.Math.Between(5000, 10000),
      callback: () => {
        this.spawnRandomPowerup();
        this.startPowerupSpawner();
      },
      callbackScope: this,
    });
  }

  private spawnRandomPowerup(): void {
    const types = ['speed', 'explosion', 'bomb'];
    const colors = { speed: 0x00ff00, explosion: 0xff0000, bomb: 0x0000ff };

    let validPosition = false;
    let gridX = 0;
    let gridY = 0;
    let attempts = 0;
    const maxAttempts = 50;

    while (!validPosition && attempts < maxAttempts) {
      gridX = Phaser.Math.Between(0, this.BOARD_SIZE - 1);
      gridY = Phaser.Math.Between(0, this.BOARD_SIZE - 1);
      attempts++;

      const isCorner =
          (gridX < 2 && gridY < 2) ||
          (gridX >= this.BOARD_SIZE - 2 && gridY < 2) ||
          (gridX < 2 && gridY >= this.BOARD_SIZE - 2) ||
          (gridX >= this.BOARD_SIZE - 2 && gridY >= this.BOARD_SIZE - 2);

      if (isCorner) continue;

      const cellX = gridX * this.CELL_SIZE + this.CELL_SIZE / 2;
      const cellY = gridY * this.CELL_SIZE + this.CELL_SIZE / 2;

      let hasPlayer = false;
      this.players.forEach((player) => {
        const pos = player.getGridPosition();
        if (pos.x === gridX && pos.y === gridY) {
          hasPlayer = true;
        }
      });

      if (hasPlayer) continue;
      validPosition = true;
    }

    if (validPosition) {
      const cellX = gridX * this.CELL_SIZE + this.CELL_SIZE / 2;
      const cellY = gridY * this.CELL_SIZE + this.CELL_SIZE / 2;
      const type = Phaser.Utils.Array.GetRandom(types);

      const powerup = this.add.circle(
          cellX,
          cellY,
          this.CELL_SIZE * 0.3,
          colors[type as keyof typeof colors],
      );
      powerup.setData('type', type);
      this.powerups.add(powerup);

      powerup.setScale(0);
      this.tweens.add({
        targets: powerup,
        scale: 1,
        duration: 300,
        ease: 'Back.easeOut',
      });

      this.tweens.add({
        targets: powerup,
        scale: { from: 0.8, to: 1.2 },
        alpha: { from: 0.7, to: 1 },
        duration: 800,
        yoyo: true,
        repeat: -1,
      });
    }
  }
}
