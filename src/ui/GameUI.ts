import { ScoringSystem } from '../systems/ScoringSystem'
import { PowerUpSystem } from '../systems/PowerUpSystem'

export class GameUI {
  private scoreText: Phaser.GameObjects.Text
  private streakText: Phaser.GameObjects.Text
  private shieldText: Phaser.GameObjects.Text
  private scoringSystem: ScoringSystem
  private powerUpSystem?: PowerUpSystem

  constructor(scene: Phaser.Scene, scoringSystem: ScoringSystem, powerUpSystem?: PowerUpSystem) {
    this.scoringSystem = scoringSystem
    this.powerUpSystem = powerUpSystem
    
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
    
    // Shield status text (initially hidden)
    this.shieldText = scene.add.text(50, 150, '', {
      fontSize: '20px',
      color: '#00ffff',
      fontFamily: 'Arial'
    }).setScrollFactor(0).setVisible(false)
  }

  update(): void {
    const data = this.scoringSystem.getData()
    this.scoreText.setText(`Score: ${data.score}`)
    this.streakText.setText(`Streak: ${data.perfectStreak} (${data.currentMultiplier}x)`)
    
    // Update shield display
    if (this.powerUpSystem) {
      const isShieldActive = this.powerUpSystem.isShieldActive()
      
      if (isShieldActive) {
        const remainingTime = this.powerUpSystem.getShieldRemainingTime()
        const seconds = Math.ceil(remainingTime / 1000)
        this.shieldText.setText(`🛡️ Shield: ${seconds}s`)
        this.shieldText.setVisible(true)
        
        // Change color to red when shield is about to expire (3 seconds)
        if (seconds <= 3) {
          this.shieldText.setColor('#ff4444')
        } else {
          this.shieldText.setColor('#00ffff')
        }
      } else {
        this.shieldText.setVisible(false)
      }
    }
  }

  destroy(): void {
    this.scoreText.destroy()
    this.streakText.destroy()
    this.shieldText.destroy()
  }
}