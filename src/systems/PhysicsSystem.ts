import { Basketball } from '../objects/Basketball'
import { GameConstants } from '../types/GameTypes'
import GameConstantsConfig, { BoundaryConstants } from '../config/GameConstants'

export class PhysicsSystem {
  private basketball: Basketball
  private constants: GameConstants
  private gameStarted: boolean = false
  private gameOverMode: boolean = false

  constructor(basketball: Basketball, constants: GameConstants) {
    this.basketball = basketball
    this.constants = constants
  }

  setGameStarted(started: boolean): void {
    this.gameStarted = started
  }

  setGameOverMode(gameOver: boolean): void {
    this.gameOverMode = gameOver
    if (gameOver) {
      // Stop horizontal movement and let gravity take over
      const ball = this.basketball.getData()
      ball.velocityX = 0
    }
  }

  update(deltaTime: number): void {
    const dt = deltaTime / 1000
    this.updateBasketballPhysics(dt)
  }

  private updateBasketballPhysics(dt: number): void {
    const ball = this.basketball.getData()
    
    // Apply physics in different modes
    if (this.gameOverMode) {
      // In game over mode, only apply gravity until hitting bottom boundary
      const ballRadius = this.basketball.radius
      const bottomBoundary = BoundaryConstants.bottom
      
      if (ball.sprite.y + ballRadius < bottomBoundary) {
        ball.velocityY += this.constants.gravity * dt * 2 // Faster fall
        ball.sprite.y += ball.velocityY * dt
        
        // Check if ball would go past bottom boundary and stop it there
        if (ball.sprite.y + ballRadius >= bottomBoundary) {
          ball.sprite.y = bottomBoundary - ballRadius
          ball.velocityY = 0 // Stop falling
        }
      }
    } else if (this.gameStarted) {
      // Normal gameplay physics
      ball.velocityY += this.constants.gravity * dt
      ball.sprite.y += ball.velocityY * dt
      ball.sprite.x += ball.velocityX * dt
      ball.velocityX = Math.max(ball.velocityX * 0.998, this.constants.horizontalSpeed)
    }
    // Ball remains stationary when game hasn't started
    
    if (Math.abs(ball.angularVelocity) > 0.1) {
      ball.angularVelocity *= 0.95
      
      if (Math.abs(ball.angularVelocity) < 0.1) {
        ball.angularVelocity = 0
      }
    }
    
    ball.sprite.rotation += ball.angularVelocity * dt
  }

  checkBoundaries(): boolean {
    const ball = this.basketball
    
    // Check top boundary collision
    if (ball.y - ball.radius <= BoundaryConstants.top) {
      return true
    }
    
    // Check bottom boundary collision
    if (ball.y + ball.radius >= BoundaryConstants.bottom) {
      return true
    }
    
    return false
  }
}