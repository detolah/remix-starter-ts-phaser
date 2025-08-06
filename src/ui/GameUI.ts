import { ScoringSystem } from '../systems/ScoringSystem'

export class GameUI {
  private scoreText: Phaser.GameObjects.Text
  private streakText: Phaser.GameObjects.Text
  private scoringSystem: ScoringSystem

  constructor(scene: Phaser.Scene, scoringSystem: ScoringSystem) {
    this.scoringSystem = scoringSystem
    
    this.scoreText = scene.add.text(50, 50, 'Score: 0', {
      fontSize: '32px',
      color: '#ffffff',
      fontFamily: 'Arial'
    }).setScrollFactor(0)
    
    this.streakText = scene.add.text(50, 100, 'Streak: 0 (1x)', {
      fontSize: '24px',
      color: '#ffffff',
      fontFamily: 'Arial'
    }).setScrollFactor(0)
  }

  update(): void {
    const data = this.scoringSystem.getData()
    this.scoreText.setText(`Score: ${data.score}`)
    this.streakText.setText(`Streak: ${data.perfectStreak} (${data.currentMultiplier}x)`)
  }

  destroy(): void {
    this.scoreText.destroy()
    this.streakText.destroy()
  }
}