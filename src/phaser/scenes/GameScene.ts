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
        // Ajustar cámara para que se vea todo el tablero
        const boardWidth = this.BOARD_SIZE * this.CELL_SIZE;
        const boardHeight = this.BOARD_SIZE * this.CELL_SIZE;
        this.cameras.main.setViewport(0, 0, boardWidth, boardHeight);

        this.createBoard();
        this.createPlayers();
        this.setupInput();
        this.setupGroups();
        this.startPowerupSpawner();
    }

    private createBoard(): void {
        // Create background - tono tierra/arena
        const boardWidth = this.BOARD_SIZE * this.CELL_SIZE;
        const boardHeight = this.BOARD_SIZE * this.CELL_SIZE;

        this.add.rectangle(
            boardWidth / 2,
            boardHeight / 2,
            boardWidth,
            boardHeight,
            0x3e9e57, // Arena/tierra
        );

        // Create grid lines for visual clarity
        for (let i = 0; i <= this.BOARD_SIZE; i++) {
            // Vertical lines
            this.add
                .line(0, 0, i * this.CELL_SIZE, 0, i * this.CELL_SIZE, boardHeight, 0x000000, 0.3)
                .setOrigin(0);

            // Horizontal lines
            this.add
                .line(0, 0, 0, i * this.CELL_SIZE, boardWidth, i * this.CELL_SIZE, 0x000000, 0.3)
                .setOrigin(0);
        }

        this.indestructibleBlocks = this.add.group();
        this.blocks = this.add.group();

        // Pattern: indestructible blocks in grid pattern
        for (let row = 0; row < this.BOARD_SIZE; row++) {
            for (let col = 0; col < this.BOARD_SIZE; col++) {
                // Verificar si estamos en una esquina (área 2x2 en cada esquina)
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

                // Indestructible blocks in grid pattern (every other cell) - Gris oscuro/roca
                // NO crear bloques en las esquinas
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
                // Destructible blocks - Marrón/madera
                // Tampoco en las esquinas
                else if (!isCorner && Math.random() < 0.6) {
                    const block = this.add.rectangle(
                        col * this.CELL_SIZE + this.CELL_SIZE / 2,
                        row * this.CELL_SIZE + this.CELL_SIZE / 2,
                        this.CELL_SIZE * 0.85,
                        this.CELL_SIZE * 0.85,
                        0xa0826d,
                    );
                    block.setData('blockType', 'destructible');
                    this.physics.add.existing(block, true);
                    this.blocks.add(block);
                }
            }
        }
    }

    private createPlayers(): void {
        // Corner positions - uno en cada esquina
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
                this.CELL_SIZE, // Pasar cellSize
            );

            // IMPORTANTE: Escalar el sprite del jugador para que quepa en la casilla
            const sprite = player.getSprite();
            sprite.setScale(0.3); // Ajusta este valor según el tamaño de tus sprites
            sprite.setDisplaySize(this.CELL_SIZE * 0.7, this.CELL_SIZE * 0.7);

            this.players.set(`player-${index}`, player);

            // Collision with blocks
            this.physics.add.collider(sprite, this.blocks);
            this.physics.add.collider(sprite, this.indestructibleBlocks);
        });
    }

    private setupInput(): void {
        this.cursors = this.input.keyboard!.createCursorKeys();
        this.spaceKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    }

    private setupGroups(): void {
        this.bombs = this.add.group();
        this.powerups = this.add.group();
    }

    update(): void {
        // Control first player (local player)
        const localPlayer = this.players.get('player-0');
        if (localPlayer) {
            localPlayer.handleInput(this.cursors);

            // Place bomb
            if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
                this.placeBomb(localPlayer);
            }
        }
    }

    private placeBomb(player: Player): void {
        const sprite = player.getSprite();
        const gridX = Math.floor(sprite.x / this.CELL_SIZE);
        const gridY = Math.floor(sprite.y / this.CELL_SIZE);

        const bombX = gridX * this.CELL_SIZE + this.CELL_SIZE / 2;
        const bombY = gridY * this.CELL_SIZE + this.CELL_SIZE / 2;

        // Crear huevo bonito con gráficos
        const bomb = this.add.container(bombX, bombY);

        // Huevo base
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

        // Puntos/manchas en el huevo
        const spot1 = this.add.circle(4, -5, this.CELL_SIZE * 0.08, 0xd2691e, 0.5);
        const spot2 = this.add.circle(-6, 3, this.CELL_SIZE * 0.06, 0xd2691e, 0.5);

        // Mecha encendida
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

        // Animación de parpadeo de la chispa
        this.tweens.add({
            targets: spark,
            alpha: { from: 1, to: 0.3 },
            scale: { from: 1, to: 1.3 },
            duration: 300,
            yoyo: true,
            repeat: -1,
        });

        // Animación de balanceo del huevo
        this.tweens.add({
            targets: bomb,
            angle: { from: -5, to: 5 },
            duration: 200,
            yoyo: true,
            repeat: -1,
        });

        // Timer of 3 seconds
        this.time.delayedCall(3000, () => {
            this.explodeBomb(bomb, gridX, gridY);
        });
    }

    private explodeBomb(bomb: Phaser.GameObjects.Container, gridX: number, gridY: number): void {
        // Create explosion animation
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

        // Explosion range (cross pattern)
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

                // Explosion visual effect
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

                // Check for destructible blocks
                this.blocks.getChildren().forEach((block) => {
                    const b = block as Phaser.GameObjects.Rectangle;
                    if (Math.abs(b.x - cellX) < 10 && Math.abs(b.y - cellY) < 10) {
                        // Destroy animation
                        this.tweens.add({
                            targets: block,
                            alpha: 0,
                            scale: 0,
                            duration: 200,
                            onComplete: () => block.destroy(),
                        });
                    }
                });

                // Damage players
                this.players.forEach((player) => {
                    const sprite = player.getSprite();
                    if (
                        Math.abs(sprite.x - cellX) < this.CELL_SIZE / 2 &&
                        Math.abs(sprite.y - cellY) < this.CELL_SIZE / 2
                    ) {
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
        // Spawn power-up cada 5-10 segundos
        this.time.addEvent({
            delay: Phaser.Math.Between(5000, 10000),
            callback: () => {
                this.spawnRandomPowerup();
                // Reprogramar el siguiente spawn
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

        // Encontrar posición válida (sin bloques, power-ups, ni jugadores)
        while (!validPosition && attempts < maxAttempts) {
            gridX = Phaser.Math.Between(0, this.BOARD_SIZE - 1);
            gridY = Phaser.Math.Between(0, this.BOARD_SIZE - 1);
            attempts++;

            // Evitar esquinas donde spawnan los jugadores
            const isCorner =
                (gridX < 2 && gridY < 2) ||
                (gridX >= this.BOARD_SIZE - 2 && gridY < 2) ||
                (gridX < 2 && gridY >= this.BOARD_SIZE - 2) ||
                (gridX >= this.BOARD_SIZE - 2 && gridY >= this.BOARD_SIZE - 2);

            if (isCorner) continue;

            const cellX = gridX * this.CELL_SIZE + this.CELL_SIZE / 2;
            const cellY = gridY * this.CELL_SIZE + this.CELL_SIZE / 2;

            // Verificar que no haya bloques
            let hasBlock = false;
            this.blocks.getChildren().forEach((block) => {
                const b = block as Phaser.GameObjects.Rectangle;
                if (Math.abs(b.x - cellX) < 10 && Math.abs(b.y - cellY) < 10) {
                    hasBlock = true;
                }
            });
            this.indestructibleBlocks.getChildren().forEach((block) => {
                const b = block as Phaser.GameObjects.Rectangle;
                if (Math.abs(b.x - cellX) < 10 && Math.abs(b.y - cellY) < 10) {
                    hasBlock = true;
                }
            });

            if (hasBlock) continue;

            // Verificar que no haya otro power-up
            let hasPowerup = false;
            this.powerups.getChildren().forEach((powerup) => {
                const p = powerup as Phaser.GameObjects.Arc;
                if (Math.abs(p.x - cellX) < 10 && Math.abs(p.y - cellY) < 10) {
                    hasPowerup = true;
                }
            });

            if (hasPowerup) continue;

            // Verificar que no haya jugadores
            let hasPlayer = false;
            this.players.forEach((player) => {
                const sprite = player.getSprite();
                if (
                    Math.abs(sprite.x - cellX) < this.CELL_SIZE &&
                    Math.abs(sprite.y - cellY) < this.CELL_SIZE
                ) {
                    hasPlayer = true;
                }
            });

            if (hasPlayer) continue;

            // Posición válida encontrada
            validPosition = true;
        }

        // Si encontramos posición válida, crear el power-up
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

            // Animación de aparición
            powerup.setScale(0);
            this.tweens.add({
                targets: powerup,
                scale: 1,
                duration: 300,
                ease: 'Back.easeOut',
            });

            // Animación de brillo continuo
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
