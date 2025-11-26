import Phaser from 'phaser';
import { Player } from '@phaser/entities/Player';
import type {
  Point,
  PlayerKilledEvent,
  BombExplodedEvent,
  GameStateUpdate,
  TileDTO,
  PlayerDTO,
  BombDTO,
  PowerUpDTO,
  PlayerMovedEvent,
  BombPlacedEvent,
} from '@/types/websocket-types';
import { Direction } from '@/types/websocket-types';

export class GameScene extends Phaser.Scene {
  private readonly players: Map<string, Player> = new Map();
  private bombs!: Phaser.GameObjects.Group;
  private blocks!: Phaser.GameObjects.Group;
  private indestructibleBlocks!: Phaser.GameObjects.Group;
  private powerups!: Phaser.GameObjects.Group;
  private localPlayerId?: string;
  private playerColors: Map<string, string> = new Map();
  private readonly CELL_SIZE = 56;
  private BOARD_SIZE = 13;
  private sceneReady = false;
  private pendingState: GameStateUpdate | null = null;
  private gameActions?: {
    sendMove?: (direction: Direction) => void;
    placeBomb?: (position: Point) => void;
    collectPowerUp?: (powerUpId: string) => void;
  };

  private lastMoveTime: number = 0;
  private readonly MOVE_COOLDOWN = 200;
  private boardInitialized = false;

  constructor() {
    super({ key: 'GameScene' });
  }

  setSessionContext(_sessionId: string, _playerId: string): void {
    console.log(_sessionId);
    console.log(_playerId);
    this.localPlayerId = _playerId;
  }

  setGameActions(actions: {
    sendMove?: (direction: Direction) => void;
    placeBomb?: (position: Point) => void;
    collectPowerUp?: (powerUpId: string) => void;
  }): void {
    this.gameActions = actions;
  }

  updateGameState(state: GameStateUpdate): void {
    console.log('📦 Updating game state:', state);
    console.log('📦 updateGameState CALLED at', new Date().toISOString());
    // console.log('📦 State:', state);

    if (!this.sceneReady) {
      console.warn('⚠️ Scene not ready yet, saving state for later');
      this.pendingState = state;
      return;
    }

    if (!this.boardInitialized && state.tiles) {
      this.initializeBoardFromBackend(state.tiles);
      this.boardInitialized = true;
    }

    if (state.players) this.updatePlayers(state.players);
    if (state.bombs) this.updateBombs(state.bombs);
    if (state.powerUps) this.updatePowerUps(state.powerUps);
  }

  handleBombExploded(event: BombExplodedEvent): void {
    console.log('💥 Bomb exploded:', event.bombId);
  }

  public handlePlayerKilled(event: PlayerKilledEvent): void {
    console.log('💀 PLAYER KILLED EVENT:', event);

    const player = this.players.get(event.victimId);
    if (player) {
      console.log('💀 Player before takeDamage:', {
        id: event.victimId,
        lives: player.getLives(),
        isAlive: player.isAlive(),
      });

      player.takeDamage();

      console.log('💀 Player after takeDamage:', {
        lives: player.getLives(),
        isAlive: player.isAlive(),
      });

      window.dispatchEvent(
        new CustomEvent('player-damage', {
          detail: {
            playerId: event.victimId,
            lives: player.getLives(),
          },
        }),
      );
    }

    this.checkForWinner();
  }

  create(): void {
    console.log('GameScene: Create called');

    const boardWidth = this.BOARD_SIZE * this.CELL_SIZE;
    const boardHeight = this.BOARD_SIZE * this.CELL_SIZE;

    this.physics.world.setBounds(0, 0, boardWidth, boardHeight);
    this.cameras.main.setBounds(0, 0, boardWidth, boardHeight);
    this.cameras.main.setZoom(1);

    this.add
      .rectangle(boardWidth / 2, boardHeight / 2, boardWidth, boardHeight, 0x3e9e57)
      .setDepth(-1);

    this.setupGroups();
    this.setupInput();

    this.sceneReady = true;
    console.log('GameScene: Scene ready, applying pending state if any...');

    if (this.pendingState) {
      console.log('✅ Applying pending state');
      const state = this.pendingState;
      this.pendingState = null;
      this.updateGameState(state);
    } else {
      console.warn('⚠️ No pending state found');
      this.events.emit('scene-ready');
    }
  }

  private initializeBoardFromBackend(tiles: TileDTO[][]): void {
    console.log('🎮 Initializing board from backend, size:', tiles.length);

    const height = tiles.length;
    const width = tiles[0]?.length || 0;

    if (!this.indestructibleBlocks || !this.blocks) {
      console.warn('⚠️ Groups not initialized yet, skipping board initialization');
      return;
    }

    if (!this.boardInitialized) {
      this.indestructibleBlocks.clear(true, true);
      this.blocks.clear(true, true);
    } else {
      return;
    }

    this.BOARD_SIZE = width;

    const boardWidth = width * this.CELL_SIZE;
    const boardHeight = height * this.CELL_SIZE;

    this.physics.world.setBounds(0, 0, boardWidth, boardHeight);
    this.cameras.main.setBounds(0, 0, boardWidth, boardHeight);

    for (let i = 0; i <= width; i++) {
      this.add
        .line(0, 0, i * this.CELL_SIZE, 0, i * this.CELL_SIZE, boardHeight, 0x2d7a44, 0.5)
        .setOrigin(0);
    }

    for (let i = 0; i <= height; i++) {
      this.add
        .line(0, 0, 0, i * this.CELL_SIZE, boardWidth, i * this.CELL_SIZE, 0x2d7a44, 0.5)
        .setOrigin(0);
    }

    for (let row = 0; row < height; row++) {
      for (let col = 0; col < width; col++) {
        const tile = tiles[row][col];
        this.createTileVisual(tile);
      }
    }

    console.log('✅ Board initialized from backend');
    this.boardInitialized = true;
  }

  private createTileVisual(tile: TileDTO): void {
    const x = tile.x * this.CELL_SIZE + this.CELL_SIZE / 2;
    const y = tile.y * this.CELL_SIZE + this.CELL_SIZE / 2;

    if (tile.type === 'SOLID_WALL') {
      const block = this.add.rectangle(x, y, this.CELL_SIZE * 0.9, this.CELL_SIZE * 0.9, 0x4a4a4a);
      block.setData('blockType', 'indestructible');
      block.setData('gridX', tile.x);
      block.setData('gridY', tile.y);
      block.setDepth(0);
      this.physics.add.existing(block, true);
      this.indestructibleBlocks.add(block);
    } else if (tile.type === 'DESTRUCTIBLE_WALL') {
      const block = this.add.rectangle(
        x,
        y,
        this.CELL_SIZE * 0.85,
        this.CELL_SIZE * 0.85,
        0xa0826d,
      );
      block.setData('blockType', 'destructible');
      block.setData('gridX', tile.x);
      block.setData('gridY', tile.y);
      block.setDepth(0);
      this.physics.add.existing(block, true);
      this.blocks.add(block);
    }
  }

  private updatePlayers(playersData: PlayerDTO[]): void {
    console.log(
      '🔍 Players from server:',
      playersData.map((p) => p.id),
    );
    console.log('🔍 localPlayerId:', this.localPlayerId);
    console.log(
      '🔄 Updating players with data:',
      playersData.map((p) => ({
        id: p.id,
        lifeCount: p.lifeCount,
        deaths: p.deaths,
        calculated: p.lifeCount - p.deaths,
      })),
    );

    playersData.forEach((playerData) => {
      let player = this.players.get(playerData.id);

      if (!player) {
        console.log('🆕 Creating new player with data:', playerData);
        const colorMap = ['blue', 'green', 'orange', 'purple'];
        const color =
          this.playerColors.get(playerData.id) ||
          colorMap[this.playerColors.size % colorMap.length];

        this.playerColors.set(playerData.id, color);

        player = new Player(
          this,
          playerData.posX * this.CELL_SIZE + this.CELL_SIZE / 2,
          playerData.posY * this.CELL_SIZE + this.CELL_SIZE / 2,
          `player-${color}`,
          playerData.id,
          this.CELL_SIZE,
        );

        if (playerData.lifeCount !== undefined) {
          player.setLives(playerData.lifeCount - playerData.deaths);
          console.log(
            `✅ Set initial lives for ${playerData.id}: ${playerData.lifeCount - playerData.deaths}`,
          );
        }

        this.players.set(playerData.id, player);
        console.log('➕ Created player:', playerData.id);
      } else {
        const currentPos = player.getGridPosition();
        if (currentPos.x !== playerData.posX || currentPos.y !== playerData.posY) {
          player.moveToCell(playerData.posX, playerData.posY, this.BOARD_SIZE);
        }

        if (playerData.lifeCount !== undefined) {
          player.setLives(playerData.lifeCount - playerData.deaths);
        }
      }
    });

    this.checkForWinner();
  }

  private checkForWinner(): void {
    console.log('=== CHECKING FOR WINNER ===');

    const alivePlayers = Array.from(this.players.values()).filter((p) => {
      const lives = p.getLives(); // Usar getLives() directamente
      console.log(`Player ${p.getPlayerId()} lives:`, lives);
      return lives > 0;
    });

    console.log('🔍 Alive players count:', alivePlayers.length);

    if (alivePlayers.length === 1 && this.players.size > 1) {
      const winner = alivePlayers[0];
      console.log('🏆 Winner:', winner.getPlayerId());

      // Obtener el color del sprite del ganador
      const winnerSprite = winner.getSprite();
      const colorFromTexture = winnerSprite.texture.key; // Ej: 'player-blue'

      this.time.delayedCall(2000, () => {
        this.scene.start('GameOverScene', {
          winner: winner.getPlayerId(),
          winnerColor: colorFromTexture, // ⬅️ Pasar el color
        });
      });
    }
    console.log('=== END CHECK ===');
  }

  private updateBombs(bombsData: BombDTO[]): void {
    if (!this.bombs) return; // Validar grupo existe

    const currentBombIds = new Set(bombsData.map((b) => b.id));

    this.bombs.getChildren().forEach((bomb) => {
      const container = bomb as Phaser.GameObjects.Container;
      const bombId = container.getData('bombId') as string | undefined;
      if (bombId && !currentBombIds.has(bombId)) {
        bomb.destroy();
      }
    });

    bombsData.forEach((bombData) => {
      const existingBomb = this.bombs.getChildren().find((b) => {
        const container = b as Phaser.GameObjects.Container;
        return container.getData('bombId') === bombData.id;
      });

      if (!existingBomb) {
        this.createBombVisual(bombData);
      }
    });
  }

  private createBombVisual(bombData: BombDTO): void {
    const bombX = bombData.posX * this.CELL_SIZE + this.CELL_SIZE / 2;
    const bombY = bombData.posY * this.CELL_SIZE + this.CELL_SIZE / 2;

    const bomb = this.add.container(bombX, bombY);
    bomb.setData('bombId', bombData.id);
    bomb.setData('gridX', bombData.posX);
    bomb.setData('gridY', bombData.posY);

    const eggBody = this.add.ellipse(0, 0, this.CELL_SIZE * 0.6, this.CELL_SIZE * 0.75, 0xffe4b5);
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
    const fuse = this.add.rectangle(0, -this.CELL_SIZE * 0.45, 2, this.CELL_SIZE * 0.2, 0x8b4513);
    const spark = this.add.circle(0, -this.CELL_SIZE * 0.5, 3, 0xff4500);

    bomb.add([eggBody, eggShine, spot1, spot2, fuse, spark]);
    bomb.setDepth(35);
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
  }

  private updatePowerUps(powerUpsData: PowerUpDTO[]): void {
    if (!this.powerups) return; // Validar grupo existe

    const currentPowerUpIds = new Set(powerUpsData.map((p) => p.id));

    this.powerups.getChildren().forEach((powerup) => {
      const circle = powerup as Phaser.GameObjects.Arc;
      const powerupId = circle.getData('powerupId') as string | undefined;
      if (powerupId && !currentPowerUpIds.has(powerupId)) {
        powerup.destroy();
      }
    });

    powerUpsData.forEach((powerUpData) => {
      const existing = this.powerups.getChildren().find((p) => {
        const circle = p as Phaser.GameObjects.Arc;
        return circle.getData('powerupId') === powerUpData.id;
      });

      if (!existing) {
        this.createPowerUpVisual(powerUpData);
      }
    });
  }

  private createPowerUpVisual(powerUpData: PowerUpDTO): void {
    const x = powerUpData.posX * this.CELL_SIZE + this.CELL_SIZE / 2;
    const y = powerUpData.posY * this.CELL_SIZE + this.CELL_SIZE / 2;

    const colors: Record<string, number> = {
      SPEED_UP: 0x00ff00,
      BOMB_RANGE_UP: 0xff0000,
      BOMB_COUNT_UP: 0x0000ff,
      EXTRA_LIFE: 0xffd700,
      TEMPORARY_SHIELD: 0x00ffff,
    };

    const color = colors[powerUpData.type] || 0xffffff;
    const powerup = this.add.circle(x, y, this.CELL_SIZE * 0.3, color);
    powerup.setData('powerupId', powerUpData.id);
    powerup.setData('type', powerUpData.type);
    this.powerups.add(powerup);

    this.tweens.add({
      targets: powerup,
      scale: { from: 0.8, to: 1.2 },
      alpha: { from: 0.7, to: 1 },
      duration: 800,
      yoyo: true,
      repeat: -1,
    });
  }

  // private updateTiles(tiles: TileDTO[][]): void {
  //   if (!this.blocks) return;
  //
  //   this.blocks.getChildren().forEach((block) => {
  //     const rect = block as Phaser.GameObjects.Rectangle;
  //     const gridX = rect.getData('gridX') as number;
  //     const gridY = rect.getData('gridY') as number;
  //
  //     const tile = tiles[gridY]?.[gridX];
  //     if (!tile || tile.type !== 'DESTRUCTIBLE_WALL') {
  //       this.tweens.add({
  //         targets: block,
  //         alpha: 0,
  //         scale: 0,
  //         duration: 200,
  //         onComplete: () => block.destroy(),
  //       });
  //     }
  //   });
  // }

  private setupGroups(): void {
    this.bombs = this.add.group();
    this.powerups = this.add.group();
    this.blocks = this.add.group();
    this.indestructibleBlocks = this.add.group();
  }

  private setupInput(): void {
    this.input.keyboard!.on('keydown-UP', () => this.handleMoveInput(0, -1));
    this.input.keyboard!.on('keydown-DOWN', () => this.handleMoveInput(0, 1));
    this.input.keyboard!.on('keydown-LEFT', () => this.handleMoveInput(-1, 0));
    this.input.keyboard!.on('keydown-RIGHT', () => this.handleMoveInput(1, 0));
    this.input.keyboard!.on('keydown-SPACE', () => this.handlePlaceBomb());
  }

  private handleMoveInput(dx: number, dy: number): void {
    console.log('🎹 Key pressed:', dx, dy);
    const currentTime = this.time.now;

    if (currentTime - this.lastMoveTime < this.MOVE_COOLDOWN) {
      return;
    }

    const directionMap: Record<string, Direction> = {
      '0,-1': Direction.UP,
      '0,1': Direction.DOWN,
      '-1,0': Direction.LEFT,
      '1,0': Direction.RIGHT,
    };

    const direction = directionMap[`${dx},${dy}`];

    console.log('📍 Direction:', direction);
    console.log('🎮 gameActions:', this.gameActions);

    if (direction && this.gameActions?.sendMove) {
      console.log('✅ Calling sendMove');

      this.gameActions.sendMove(direction);
      this.lastMoveTime = currentTime;
    } else {
      console.log('❌ Cannot send move');
    }
  }

  private handlePlaceBomb(): void {
    console.log('🎯 handlePlaceBomb called');
    console.log('🎯 localPlayerId:', this.localPlayerId);
    console.log('🎯 players in map:', Array.from(this.players.keys()));

    if (!this.localPlayerId) {
      console.error('❌ No localPlayerId set');
      return;
    }

    const localPlayer = this.players.get(this.localPlayerId);
    console.log('🎯 localPlayer found:', localPlayer);

    if (localPlayer && this.gameActions?.placeBomb) {
      const pos = localPlayer.getGridPosition();
      console.log('🎯 Placing bomb at:', pos);
      this.gameActions.placeBomb({ x: pos.x, y: pos.y });
    } else {
      console.error('❌ Cannot place bomb. Player or action missing');
    }
  }

  // ============================================================================
  // NEW EVENT HANDLERS (Performance Optimization)
  // ============================================================================

  /**
   * Handles individual player movement event.
   * Only updates the specific player that moved (not all players).
   */
  handlePlayerMovedEvent(event: PlayerMovedEvent): void {
    console.log('📍 Player moved event:', event);

    const player = this.players.get(event.playerId);

    if (player) {
      // Only update THIS player's position
      player.moveToCell(event.newX, event.newY, this.BOARD_SIZE);
    } else {
      // Player doesn't exist locally - might be desync
      console.warn('⚠️ Unknown player moved:', event.playerId);
    }
  }

  /**
   * Handles individual bomb placement event.
   * Only creates the specific bomb that was placed (not updating entire bomb list).
   */
  handleBombPlacedEvent(event: BombPlacedEvent): void {
    console.log('💣 Bomb placed event:', event);

    // Check if bomb already exists (prevent duplicates)
    const existingBomb = this.bombs.getChildren().find((b) => {
      const container = b as Phaser.GameObjects.Container;
      return container.getData('bombId') === event.bombId;
    });

    if (!existingBomb) {
      // Create ONLY this new bomb
      this.createBombVisual({
        id: event.bombId,
        ownerId: event.playerId,
        posX: event.x,
        posY: event.y,
        range: event.range,
        timeToExplode: event.timeToExplode,
      });
    } else {
      console.warn('⚠️ Bomb already exists:', event.bombId);
    }
  }

  /**
   * Handles periodic full state synchronization (checkpoint).
   * Replaces entire game state to prevent drift.
   */
  handlePeriodicSync(state: GameStateUpdate): void {
    console.log('🔄 Periodic checkpoint received');
    // Use the existing updateGameState method for full sync
    this.updateGameState(state);
  }

  update(): void {
    // El update ahora se maneja mediante WebSocket
    this.players.forEach((player) => player.update());
  }
}
