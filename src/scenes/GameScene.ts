import { Basketball } from '../objects/Basketball'
import { BasketballRing } from '../objects/BasketballRing'
import { InputSystem } from '../systems/InputSystem'
import { PhysicsSystem } from '../systems/PhysicsSystem'
import { CollisionSystem } from '../systems/CollisionSystem'
import { ScoringSystem } from '../systems/ScoringSystem'
import { RingManager } from '../systems/RingManager'
import { CameraSystem } from '../systems/CameraSystem'
import { GameUI } from '../ui/GameUI'
import { GameOverUI } from '../ui/GameOverUI'
import GameConstants, { PhysicsConstants, RingConstants } from '../config/GameConstants'

export class GameScene extends Phaser.Scene {
  private basketball!: Basketball
  private inputSystem!: InputSystem
  private physicsSystem!: PhysicsSystem
  private collisionSystem!: CollisionSystem
  private scoringSystem!: ScoringSystem
  private ringManager!: RingManager
  private cameraSystem!: CameraSystem
  private gameUI!: GameUI
  private gameOverUI: GameOverUI | null = null
  private gameOver: boolean = false
  private topBoundary!: Phaser.GameObjects.Rectangle
  private bottomBoundary!: Phaser.GameObjects.Rectangle
  private topBoundaryLine!: Phaser.GameObjects.Rectangle

  private constants = GameConstants

  constructor() {
    super({ key: "GameScene" })
  }

  preload(): void {}

  create(): void {
    this.initializeGameObjects()
    this.initializeSystems()
    this.initializeUI()
    this.createBoundaryVisuals()
  }

  private initializeGameObjects(): void {
    this.basketball = new Basketball(this)
  }

  private initializeSystems(): void {
    this.scoringSystem = new ScoringSystem()
    this.physicsSystem = new PhysicsSystem(this.basketball, this.constants.physics)
    this.collisionSystem = new CollisionSystem()
    this.cameraSystem = new CameraSystem(this, this.basketball)
    this.ringManager = new RingManager(this, this.scoringSystem)
    this.inputSystem = new InputSystem(this, this.basketball, this.constants.physics, this.physicsSystem)
  }

  private initializeUI(): void {
    this.gameUI = new GameUI(this, this.scoringSystem)
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

  private checkRingCollisions(): void {
    if (this.gameOver) return

    const rings = this.ringManager.getRings()
    
    rings.forEach(ring => {
      if (!ring.passed && this.collisionSystem.isRingInRange(this.basketball, ring)) {
        const result = this.collisionSystem.checkRingEntrance(this.basketball, ring, this.scoringSystem.currentMultiplier)
        
        if (result.type === 'perfect') {
          ring.passed = true
          this.scoringSystem.addPerfectScore()
          this.gameUI.update()
          this.ringManager.updateRingColors()
        }
        else if (result.type === 'regular') {
          ring.passed = true
          this.scoringSystem.addRegularScore()
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
        this.triggerGameOver()
      }
    })
  }

  private triggerGameOver(): void {
    if (this.gameOver) return
    
    this.gameOver = true
    
    // Enable game over physics mode to let ball fall
    this.physicsSystem.setGameOverMode(true)
    
    // Show game over UI after a short delay to let the fall animation play
    this.time.delayedCall(800, () => {
      if (this.gameOver) { // Only show if still in game over state
        this.gameOverUI = new GameOverUI(this, this.scoringSystem.score)
        this.inputSystem.handleGameOverInput(() => this.restartGame())
      }
    })
  }

  private restartGame(): void {
    this.scene.restart()
  }

  update(_time: number, deltaTime: number): void {
    // Always update physics (even during game over for fall animation)
    this.physicsSystem.update(deltaTime)
    
    // Update camera position based on ball movement
    this.cameraSystem.update()
    
    if (this.gameOver) {
      // During game over, only update physics for fall animation
      return
    }
    
    if (this.physicsSystem.checkBoundaries()) {
      this.triggerGameOver()
      return
    }
    
    this.checkRingCollisions()
    this.ringManager.generateNewRings(this.cameraSystem.scrollX)
    this.ringManager.cleanupOldRings(this.cameraSystem.scrollX)
  }

  shutdown(): void {
    this.inputSystem?.destroy()
    this.ringManager?.destroy()
    this.gameUI?.destroy()
    this.gameOverUI?.destroy()
  }
}
