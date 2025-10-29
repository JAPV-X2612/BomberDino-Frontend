import Phaser from 'phaser';

export class GameOverScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameOverScene' });
    }

    create(data: { winner?: string }): void {
        const { width, height } = this.cameras.main;

        this.add.rectangle(width / 2, height / 2, width, height, 0x087958);
        const title = this.add.text(width / 2, height * 0.15, 'GANADOR', {
            fontSize: '96px',
            color: '#FFFFFF',
            fontFamily: 'Arial Black',
            fontStyle: 'bold',
            stroke: '#15402A',
            strokeThickness: 8,
        });
        title.setOrigin(0.5);
        title.setScale(0);

        this.tweens.add({
            targets: title,
            scale: 1,
            duration: 800,
            ease: 'Bounce.easeOut',
        });

        if (data.winner) {
            this.createWinnerAvatar(width / 2, height * 0.45, data.winner);
        }

        this.createButtons(width, height);

        this.cameras.main.fadeIn(500, 0, 0, 0);
    }

    private createWinnerAvatar(x: number, y: number, playerId: string): void {
        const container = this.add.container(x, y);

        const dinoData: { [key: string]: { color: number; name: string } } = {
            'player-0': { color: 0x4a9eff, name: 'DINO AZUL' },
            'player-1': { color: 0x7ccd7c, name: 'DINO VERDE' },
            'player-2': { color: 0xff8c42, name: 'DINO NARANJA' },
            'player-3': { color: 0xb565d8, name: 'DINO MORADO' },
        };

        const data = dinoData[playerId] || { color: 0xffd700, name: 'GANADOR' };

        const rays = this.add.star(0, 0, 12, 30, 150, 0xffd700, 0.3);
        this.tweens.add({
            targets: rays,
            angle: 360,
            duration: 8000,
            repeat: -1,
        });

        const platform = this.add.ellipse(0, 80, 200, 40, 0x8b4513, 0.6);

        const dinoColor = ['blue', 'green', 'orange', 'purple'][
            parseInt(playerId.split('-')[1]) || 0
        ];
        const textureName = `player-${dinoColor}`;

        let dino: Phaser.GameObjects.GameObject;
        if (this.textures.exists(textureName)) {
            const dinoImage = this.add.image(0, 0, textureName);
            dinoImage.setDisplaySize(220, 220);
            dinoImage.setOrigin(0.5);
            dino = dinoImage;
        } else {
            const dinoCircle = this.add.circle(0, 0, 110, data.color);
            dinoCircle.setStrokeStyle(8, 0xffffff);
            dino = dinoCircle;
        }

        this.tweens.add({
            targets: dino,
            y: -20,
            duration: 600,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1,
        });

        const crown = this.createCrown(0, -100);

        container.add([rays, platform, dino, crown]);

        container.setScale(0);
        this.tweens.add({
            targets: container,
            scale: 1,
            duration: 1000,
            ease: 'Back.easeOut',
            delay: 400,
        });
    }

    private createCrown(x: number, y: number): Phaser.GameObjects.Container {
        const crown = this.add.container(x, y);

        const base = this.add.polygon(
            0,
            0,
            [-35, 15, -25, -15, -12, -5, 0, -25, 12, -5, 25, -15, 35, 15],
            0xffd700,
        );
        base.setStrokeStyle(3, 0xff8c00);

        const egg1 = this.add.ellipse(-18, -8, 12, 15, 0xff6347);
        const egg2 = this.add.ellipse(0, -18, 12, 15, 0x32cd32);
        const egg3 = this.add.ellipse(18, -8, 12, 15, 0x1e90ff);

        crown.add([base, egg1, egg2, egg3]);

        this.tweens.add({
            targets: crown,
            angle: { from: -8, to: 8 },
            duration: 1500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
        });

        return crown;
    }

    private createVolcano(x: number, y: number): void {
        for (let i = 0; i < 3; i++) {
            const bubble = this.add.circle(
                x + Phaser.Math.Between(-20, 20),
                y - 40,
                Phaser.Math.Between(3, 8),
                0xff4500,
                0.8,
            );

            this.tweens.add({
                targets: bubble,
                y: y - 60,
                alpha: 0,
                duration: Phaser.Math.Between(1000, 2000),
                delay: Phaser.Math.Between(0, 1000),
                repeat: -1,
            });
        }
    }

    private createFloatingEggs(): void {
        const { width, height } = this.cameras.main;
        const colors = [0xffe4b5, 0xf5deb3, 0xdeb887];

        for (let i = 0; i < 6; i++) {
            const x = Phaser.Math.Between(50, width - 50);
            const y = Phaser.Math.Between(100, height - 100);
            const egg = this.add.ellipse(x, y, 30, 40, Phaser.Utils.Array.GetRandom(colors));
            egg.setStrokeStyle(2, 0x8b4513);
            egg.setAlpha(0.4);

            this.tweens.add({
                targets: egg,
                y: y + Phaser.Math.Between(-30, 30),
                duration: Phaser.Math.Between(3000, 5000),
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut',
            });
        }
    }

    private createMeteorConfetti(): void {
        const { width, height } = this.cameras.main;
        const colors = [0xff6b35, 0x8b4513, 0xd2691e];

        for (let i = 0; i < 30; i++) {
            const x = Phaser.Math.Between(0, width);
            const meteor = this.add.circle(x, -50, 8, Phaser.Utils.Array.GetRandom(colors));

            const trail = this.add.rectangle(x, -50, 3, 20, 0xff4500, 0.5);

            this.tweens.add({
                targets: [meteor, trail],
                y: height + 50,
                duration: Phaser.Math.Between(2000, 4000),
                delay: Phaser.Math.Between(0, 3000),
                repeat: -1,
            });
        }
    }

    private createDinoFootprint(x: number, y: number): void {
        const footprint = this.add.container(x, y);

        const heel = this.add.ellipse(0, 20, 80, 100, 0x654321, 0.1);
        const toe1 = this.add.ellipse(-30, -20, 30, 50, 0x654321, 0.1);
        const toe2 = this.add.ellipse(0, -30, 30, 50, 0x654321, 0.1);
        const toe3 = this.add.ellipse(30, -20, 30, 50, 0x654321, 0.1);

        footprint.add([heel, toe1, toe2, toe3]);
        footprint.setScale(2);
    }

    private createButtons(width: number, height: number): void {
        this.createButton(
            width / 2,
            height * 0.75,
            'MENÚ',
            0x654321,
            () => (window.location.href = '/'),
        );
    }

    private createButton(
        x: number,
        y: number,
        text: string,
        color: number,
        onClick: () => void,
    ): Phaser.GameObjects.Container {
        const button = this.add.container(x, y);

        const bg = this.add.rectangle(0, 0, 240, 60, color);
        bg.setStrokeStyle(4, 0xffd700);
        bg.setInteractive({ useHandCursor: true });

        const label = this.add.text(0, 0, text, {
            fontSize: '18px',
            color: '#FFFFFF',
            fontFamily: 'Arial Black',
            fontStyle: 'bold',
        });
        label.setOrigin(0.5);

        button.add([bg, label]);

        bg.on('pointerover', () => {
            this.tweens.add({ targets: button, scale: 1.1, duration: 200 });
        });

        bg.on('pointerout', () => {
            this.tweens.add({ targets: button, scale: 1, duration: 200 });
        });

        bg.on('pointerdown', () => {
            this.tweens.add({
                targets: button,
                scale: 0.95,
                duration: 100,
                yoyo: true,
                onComplete: onClick,
            });
        });

        return button;
    }
}
