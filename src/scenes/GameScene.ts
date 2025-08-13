import { Basketball } from '../objects/Basketball'
import { BasketballRing } from '../objects/BasketballRing'
import { InputSystem } from '../systems/InputSystem'
import { PhysicsSystem } from '../systems/PhysicsSystem'
import { CollisionSystem } from '../systems/CollisionSystem'
import { ScoringSystem } from '../systems/ScoringSystem'
import { RingManager } from '../systems/RingManager'
import { CameraSystem } from '../systems/CameraSystem'
import { PowerUpSystem } from '../systems/PowerUpSystem'
import { GameUI } from '../ui/GameUI'
import { VisualEffectSystem } from '../systems/VisualEffectSystem'
import GameConstants, { PhysicsConstants, RingConstants } from '../config/GameConstants'

export class GameScene extends Phaser.Scene {
  private basketball!: Basketball
  private inputSystem!: InputSystem
  private physicsSystem!: PhysicsSystem
  private collisionSystem!: CollisionSystem
  private scoringSystem!: ScoringSystem
  private ringManager!: RingManager
  private cameraSystem!: CameraSystem
  private powerUpSystem!: PowerUpSystem
  private visualEffectSystem!: VisualEffectSystem
  private gameUI!: GameUI
  private gameOver: boolean = false
  private failedXGraphics: Phaser.GameObjects.Graphics | null = null
  private gameOverText: Phaser.GameObjects.Text | null = null
  private finalScoreText: Phaser.GameObjects.Text | null = null
  private restartText: Phaser.GameObjects.Text | null = null
  private topBoundary!: Phaser.GameObjects.Rectangle
  private bottomBoundary!: Phaser.GameObjects.Rectangle
  private topBoundaryLine!: Phaser.GameObjects.Rectangle

  private constants = GameConstants

  constructor() {
    super({ key: "GameScene" })
  }

  preload(): void {
    // Create fire particle texture programmatically
    this.createFireTexture()
  }

  create(): void {
    this.initializeGameObjects()
    this.initializeSystems()
    this.initializeUI()
    this.createBoundaryVisuals()
  }

  private createFireTexture(): void {
    // Create a simple circular texture for fire particles
    const graphics = this.add.graphics()
    graphics.fillStyle(0xffffff, 1)
    graphics.fillCircle(16, 16, 14)
    graphics.generateTexture('fire', 32, 32)
    graphics.destroy()
  }

  private initializeGameObjects(): void {
    this.basketball = new Basketball(this)
  }

  private initializeSystems(): void {
    this.scoringSystem = new ScoringSystem()
    this.physicsSystem = new PhysicsSystem(this.basketball, this.constants.physics)
    this.collisionSystem = new CollisionSystem()
    this.cameraSystem = new CameraSystem(this, this.basketball)
    this.powerUpSystem = new PowerUpSystem(this, this.basketball)
    this.visualEffectSystem = new VisualEffectSystem(this)
    
    // Wire up collision system with visual effects
    this.collisionSystem.setVisualEffectSystem(this.visualEffectSystem)
    
    this.ringManager = new RingManager(this, this.scoringSystem)
    this.ringManager.setParticleSystem(this.visualEffectSystem)
    this.ringManager.setPowerUpSystem(this.powerUpSystem)
    this.inputSystem = new InputSystem(this, this.basketball, this.constants.physics, this.physicsSystem)
  }

  private initializeUI(): void {
    this.gameUI = new GameUI(this, this.scoringSystem, this.powerUpSystem)
  }

  private createBoundaryVisuals(): void {
    const boundaryColor = 0xff0000 // Red color for visibility
    const boundaryAlpha = 0.8
    
    // Create top boundary wall (less visible background area)
    this.topBoundary = this.add.rectangle(
      this.constants.canvas.width / 2, // Center horizontally
      this.constants.boundaries.top / 2, // Center vertically in top boundary area
      this.constants.canvas.width, // Full width
      this.constants.boundaries.top, // Height equals boundary distance
      boundaryColor,
      0.3 // Lower alpha for less distraction
    )
    this.topBoundary.setStrokeStyle(2, 0xffffff, 0.3) // Subtle border
    
    // Create visible top boundary line indicator
    this.topBoundaryLine = this.add.rectangle(
      this.constants.canvas.width / 2, // Center horizontally
      this.constants.boundaries.top, // At the exact boundary position
      this.constants.canvas.width, // Full width
      4, // Thin horizontal line
      0xffffff, // White color for visibility
      1.0 // Full opacity
    )
    this.topBoundaryLine.setStrokeStyle(2, 0xff0000) // Red border for danger indication
    
    // Create bottom boundary wall
    this.bottomBoundary = this.add.rectangle(
      this.constants.canvas.width / 2, // Center horizontally
      this.constants.boundaries.bottom, // At the bottom boundary
      this.constants.canvas.width, // Full width
      50, // Fixed height for visual representation
      boundaryColor,
      boundaryAlpha
    )
    this.bottomBoundary.setStrokeStyle(4, 0xffffff) // White border
    
    // Set boundaries to follow camera for visibility
    this.topBoundary.setScrollFactor(0)
    this.topBoundaryLine.setScrollFactor(0)
    this.bottomBoundary.setScrollFactor(0)
  }

  private getBallColorForStreak(multiplier: number): number {
    switch (multiplier) {
      case 2: return this.constants.colors.streakColors.streak2 // Blue
      case 3: return this.constants.colors.streakColors.streak3 // Purple  
      case 4: return this.constants.colors.streakColors.streak4 // Orange
      case 5: return this.constants.colors.streakColors.streak5 // Gold
      default: return this.constants.colors.basketball // Default orange
    }
  }

  private checkRingCollisions(): void {
    if (this.gameOver) return

    const rings = this.ringManager.getRings()
    
    rings.forEach(ring => {
      if (!ring.passed && this.collisionSystem.isRingInRange(this.basketball, ring)) {
        const result = this.collisionSystem.checkRingEntrance(this.basketball, ring, this.scoringSystem.currentMultiplier)
        
        if (result.type === 'perfect') {
          ring.passed = true
          this.scoringSystem.addPerfectScore()
          
          // Check for power-up in the ring
          if (ring.hasPowerUp) {
            const powerUpType = ring.consumePowerUp()
            if (powerUpType) {
              // Create power-up collectible that the power-up system will handle
              this.powerUpSystem.createPowerUpCollectible(ring.x, ring.y, powerUpType)
            }
          }
          
          // Check if this perfect entrance started or leveled up a streak
          const newStreak = this.scoringSystem.perfectStreak
          const newMultiplier = this.scoringSystem.currentMultiplier
          
          // Create dramatic perfect hoop explosion
          this.visualEffectSystem.createPerfectHoopExplosion(ring.x, ring.y)
          
          // Handle streak effects and ball color changes
          if (newStreak >= 2) {
            // Update ball color and create persistent fire aura
            const newBallColor = this.getBallColorForStreak(newMultiplier)
            this.basketball.sprite.setFillStyle(newBallColor)
            
            // Create persistent fire aura around the ball
            this.visualEffectSystem.createBallFireAura(this.basketball.sprite, newMultiplier)
          }
          
          this.gameUI.update()
          this.ringManager.updateRingColors()
        }
        else if (result.type === 'regular') {
          ring.passed = true
          this.scoringSystem.addRegularScore()
          
          // Check for power-up in the ring
          if (ring.hasPowerUp) {
            const powerUpType = ring.consumePowerUp()
            if (powerUpType) {
              this.powerUpSystem.createPowerUpCollectible(ring.x, ring.y, powerUpType)
            }
          }
          
          // Remove ball fire aura when streak is broken
          this.visualEffectSystem.removeBallFireAura()
          
          // Reset ball color to default
          this.basketball.sprite.setFillStyle(this.constants.colors.basketball)
          
          this.gameUI.update()
          this.ringManager.updateRingColors()
        }
        else if (result.type === 'collision') {
          this.collisionSystem.handleRingEdgeCollision(this.basketball, ring)
        }
      }
      
      // Check if player missed the ring (passed by it without entering)
      if (!ring.passed && !ring.missed && this.basketball.x > ring.x + ring.outerRadius) {
        ring.missed = true
        // Only trigger game over if shield is not active
        if (!this.powerUpSystem.isShieldActive()) {
          this.triggerGameOver()
        }
      }
    })
  }

  private triggerGameOver(): void {
    if (this.gameOver) return
    
    this.gameOver = true
    
    // Remove ball fire effects when game ends
    this.visualEffectSystem.removeBallFireAura()
    
    // Enable game over physics mode to let ball fall
    this.physicsSystem.setGameOverMode(true)
    
    // Show the X sign immediately
    this.showFailedX()
    
    // Fade in game over text after a short delay
    this.time.delayedCall(800, () => {
      this.showGameOverText()
    })
    
    // Enable restart input
    this.inputSystem.handleGameOverInput(() => this.restartGame())
  }

  private showFailedX(): void {
    this.failedXGraphics = this.add.graphics()
    
    // Get camera position to show X in view
    const centerX = this.constants.canvas.width / 2
    const centerY = this.constants.canvas.height / 2 - 100
    const sizeX = 140  // Wider
    const sizeY = 80   // Shorter
    const thickness = 16

    // Set line style for the X with reduced opacity - white outline
    this.failedXGraphics.lineStyle(thickness + 6, 0xffffff, 0.3) // Reduced opacity white outline
    
    // Draw first diagonal line (top-left to bottom-right)
    this.failedXGraphics.beginPath()
    this.failedXGraphics.moveTo(centerX - sizeX, centerY - sizeY)
    this.failedXGraphics.lineTo(centerX + sizeX, centerY + sizeY)
    this.failedXGraphics.strokePath()
    
    // Draw second diagonal line (top-right to bottom-left)
    this.failedXGraphics.beginPath()
    this.failedXGraphics.moveTo(centerX + sizeX, centerY - sizeY)
    this.failedXGraphics.lineTo(centerX - sizeX, centerY + sizeY)
    this.failedXGraphics.strokePath()
    
    // Draw the red X on top with reduced opacity
    this.failedXGraphics.lineStyle(thickness, 0xff0000, 0.4) // Reduced opacity red
    
    // Draw first diagonal line (top-left to bottom-right)
    this.failedXGraphics.beginPath()
    this.failedXGraphics.moveTo(centerX - sizeX, centerY - sizeY)
    this.failedXGraphics.lineTo(centerX + sizeX, centerY + sizeY)
    this.failedXGraphics.strokePath()
    
    // Draw second diagonal line (top-right to bottom-left)  
    this.failedXGraphics.beginPath()
    this.failedXGraphics.moveTo(centerX + sizeX, centerY - sizeY)
    this.failedXGraphics.lineTo(centerX - sizeX, centerY + sizeY)
    this.failedXGraphics.strokePath()
    
    // Make the X stay in screen position
    this.failedXGraphics.setScrollFactor(0)
    
    // Start invisible and with small scale
    this.failedXGraphics.setScale(0).setAlpha(0)
    
    // First animate the appearance (fade in + slow scale up)
    this.tweens.add({
      targets: this.failedXGraphics,
      alpha: 1,
      scaleX: 1.0,
      scaleY: 1.0,
      duration: 800,
      ease: 'Power2.easeOut',
      onComplete: () => {
        // Then add the bounce effect
        this.tweens.add({
          targets: this.failedXGraphics,
          scaleX: 1.3,
          scaleY: 1.3,
          duration: 300,
          ease: 'Back.easeOut',
          onComplete: () => {
            // Settle back to normal size
            this.tweens.add({
              targets: this.failedXGraphics,
              scaleX: 1.0,
              scaleY: 1.0,
              duration: 200,
              ease: 'Power2.easeOut'
            })
          }
        })
      }
    })
  }

  private showGameOverText(): void {
    // Game over text
    this.gameOverText = this.add.text(
      this.constants.canvas.width / 2, 
      this.constants.canvas.height / 2 + 50, 
      'GAME OVER', 
      {
        fontSize: '64px',
        color: '#ff0000',
        fontFamily: 'Arial',
        fontStyle: 'bold'
      }
    ).setOrigin(0.5).setScrollFactor(0).setAlpha(0)
    
    // Final score text
    this.finalScoreText = this.add.text(
      this.constants.canvas.width / 2, 
      this.constants.canvas.height / 2 + 130, 
      `Final Score: ${this.scoringSystem.score}`, 
      {
        fontSize: '32px',
        color: '#ffffff',
        fontFamily: 'Arial'
      }
    ).setOrigin(0.5).setScrollFactor(0).setAlpha(0)
    
    // Restart instruction text
    this.restartText = this.add.text(
      this.constants.canvas.width / 2, 
      this.constants.canvas.height / 2 + 190, 
      'Tap to restart', 
      {
        fontSize: '24px',
        color: '#cccccc',
        fontFamily: 'Arial'
      }
    ).setOrigin(0.5).setScrollFactor(0).setAlpha(0)

    // Fade in all text elements
    this.tweens.add({
      targets: [this.gameOverText, this.finalScoreText, this.restartText],
      alpha: 1,
      duration: 1000,
      ease: 'Power2'
    })
  }

  private restartGame(): void {
    // Reset ball color and effects before restart
    this.basketball.sprite.setFillStyle(this.constants.colors.basketball)
    this.visualEffectSystem.removeBallFireAura()
    
    // Clean up game over elements
    this.cleanupGameOverElements()
    
    this.scene.restart()
  }

  private cleanupGameOverElements(): void {
    if (this.failedXGraphics) {
      this.failedXGraphics.destroy()
      this.failedXGraphics = null
    }
    if (this.gameOverText) {
      this.gameOverText.destroy()
      this.gameOverText = null
    }
    if (this.finalScoreText) {
      this.finalScoreText.destroy()
      this.finalScoreText = null
    }
    if (this.restartText) {
      this.restartText.destroy()
      this.restartText = null
    }
  }

  update(_time: number, deltaTime: number): void {
    // Always update physics (even during game over for fall animation)
    this.physicsSystem.update(deltaTime)
    
    // Update camera position based on ball movement
    this.cameraSystem.update()
    
    // Update visual effects (keep fire aura following ball)
    this.visualEffectSystem.updateBallFirePosition(this.basketball.sprite)
    
    // Update power-up system (timers, visual effects, etc.)
    this.powerUpSystem.update()
    
    if (this.gameOver) {
      // During game over, only update physics for fall animation
      return
    }
    
    // Check boundary collisions (with shield protection)
    if (this.physicsSystem.checkBoundaries() && !this.powerUpSystem.isShieldActive()) {
      this.triggerGameOver()
      return
    }
    
    // Check power-up collection
    this.powerUpSystem.checkPowerUpCollision(this.basketball)
    
    this.checkRingCollisions()
    this.ringManager.generateNewRings(this.cameraSystem.scrollX)
    this.ringManager.cleanupOldRings(this.cameraSystem.scrollX)
  }

  shutdown(): void {
    this.inputSystem?.destroy()
    this.ringManager?.destroy()
    this.powerUpSystem?.destroy()
    this.visualEffectSystem?.destroy()
    this.gameUI?.destroy()
    
    // Clean up game over elements
    this.cleanupGameOverElements()
  }
}
