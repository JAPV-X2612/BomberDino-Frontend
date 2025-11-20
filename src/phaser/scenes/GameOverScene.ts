import Phaser from 'phaser';

export class GameOverScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameOverScene' });
  }

  create(data: { winner?: string; winnerColor?: string }): void {
    const { width, height } = this.cameras.main;

    this.add.rectangle(width / 2, height / 2, width, height, 0x206537);

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

    if (data.winner && data.winnerColor) {
      this.createWinnerAvatar(width / 2, height * 0.45, data.winnerColor);
    }

    this.createButtons(width, height);
    this.cameras.main.fadeIn(500, 0, 0, 0);
  }

  private createWinnerAvatar(x: number, y: number, playerTexture: string): void {
    const container = this.add.container(x, y);

    const colorMap: { [key: string]: { name: string } } = {
      'player-blue': { name: 'DINO AZUL' },
      'player-green': { name: 'DINO VERDE' },
      'player-orange': { name: 'DINO NARANJA' },
      'player-purple': { name: 'DINO MORADO' },
    };

    const data = colorMap[playerTexture] || { name: 'GANADOR' };

    // Rayos dorados
    const rays = this.add.star(0, 0, 12, 30, 150, 0xffd700, 0.3);
    this.tweens.add({
      targets: rays,
      angle: 360,
      duration: 8000,
      repeat: -1,
    });

    // Plataforma
    const platform = this.add.ellipse(0, 80, 180, 40, 0x2d5a3d, 0.5);

    // Imagen del dino (extraer el color del texture: 'player-blue' -> 'blue')
    const color = playerTexture.replace('player-', '');
    const dinoSprite = this.add.image(0, 0, `player-${color}`);
    dinoSprite.setScale(0.5); // Ajusta el tamaño según necesites

    // Corona
    const crown = this.add.star(0, -100, 5, 15, 25, 0xffd700);

    container.add([rays, platform, dinoSprite, crown]);

    // Animación flotante
    this.tweens.add({
      targets: container,
      y: y - 20,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Nombre del ganador
    const nameText = this.add.text(x, y + 140, data.name, {
      fontSize: '48px',
      color: '#FFFFFF',
      fontFamily: 'Arial Black',
      stroke: '#15402A',
      strokeThickness: 6,
    });
    nameText.setOrigin(0.5);
  }

  private createButtons(width: number, height: number): void {
    const menuButton = this.add.rectangle(width / 2, height * 0.8, 200, 60, 0x8b6914);
    menuButton.setStrokeStyle(4, 0xffd700);
    menuButton.setInteractive({ useHandCursor: true });

    const menuText = this.add.text(width / 2, height * 0.8, 'MENÚ', {
      fontSize: '32px',
      color: '#FFFFFF',
      fontFamily: 'Arial Black',
    });
    menuText.setOrigin(0.5);

    menuButton.on('pointerover', () => {
      menuButton.setFillStyle(0xa67c1a);
      menuButton.setScale(1.05);
    });

    menuButton.on('pointerout', () => {
      menuButton.setFillStyle(0x8b6914);
      menuButton.setScale(1);
    });

    menuButton.on('pointerdown', () => {
      this.cameras.main.fadeOut(500, 0, 0, 0);
      this.time.delayedCall(500, () => {
        window.location.href = '/';
      });
    });
  }
}
