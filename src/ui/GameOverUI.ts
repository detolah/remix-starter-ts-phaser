import GameSettings from '../config/GameSettings'

export class GameOverUI {
  private gameOverText: Phaser.GameObjects.Text
  private finalScoreText: Phaser.GameObjects.Text
  private restartText: Phaser.GameObjects.Text

  constructor(scene: Phaser.Scene, finalScore: number) {
    this.gameOverText = scene.add.text(GameSettings.canvas.width / 2, GameSettings.canvas.height / 2, 'GAME OVER', {
      fontSize: '64px',
      color: '#ff0000',
      fontFamily: 'Arial'
    }).setOrigin(0.5).setScrollFactor(0)
    
    this.finalScoreText = scene.add.text(GameSettings.canvas.width / 2, GameSettings.canvas.height / 2 + 80, `Final Score: ${finalScore}`, {
      fontSize: '32px',
      color: '#ffffff',
      fontFamily: 'Arial'
    }).setOrigin(0.5).setScrollFactor(0)
    
    this.restartText = scene.add.text(GameSettings.canvas.width / 2, GameSettings.canvas.height / 2 + 140, 'Tap to restart', {
      fontSize: '24px',
      color: '#cccccc',
      fontFamily: 'Arial'
    }).setOrigin(0.5).setScrollFactor(0)
  }

  destroy(): void {
    this.gameOverText.destroy()
    this.finalScoreText.destroy()
    this.restartText.destroy()
  }
}