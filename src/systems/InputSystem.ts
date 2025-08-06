import { Basketball } from '../objects/Basketball'
import { GameConstants } from '../types/GameTypes'
import { PhysicsSystem } from './PhysicsSystem'

export class InputSystem {
  private basketball: Basketball
  private constants: GameConstants
  private tapStartTime: number = 0
  private isTapping: boolean = false
  private scene: Phaser.Scene
  private gameStarted: boolean = false
  private physicsSystem: PhysicsSystem

  constructor(scene: Phaser.Scene, basketball: Basketball, constants: GameConstants, physicsSystem: PhysicsSystem) {
    this.scene = scene
    this.basketball = basketball
    this.constants = constants
    this.physicsSystem = physicsSystem
    this.setupInput()
  }

  private setupInput(): void {
    this.scene.input.on('pointerdown', () => {
      this.startTap()
    })
    
    this.scene.input.on('pointerup', () => {
      if (this.isTapping) {
        this.endTap()
      }
    })
  }

  private startTap(): void {
    this.tapStartTime = this.scene.time.now
    this.isTapping = true
  }

  private endTap(): void {
    if (!this.isTapping) return
    
    const tapDuration = Math.min(this.scene.time.now - this.tapStartTime, 300)
    const jumpIntensity = tapDuration / 300
    
    const jumpForce = this.constants.baseJumpForce + (this.constants.maxJumpForce - this.constants.baseJumpForce) * jumpIntensity
    const horizontalBoost = this.constants.jumpBoostX * (0.5 + jumpIntensity * 0.5)
    
    this.basketball.velocityY = jumpForce
    
    // Only add horizontal velocity after first tap
    if (!this.gameStarted) {
      this.gameStarted = true
      this.physicsSystem.setGameStarted(true)
    }
    this.basketball.velocityX = this.constants.horizontalSpeed + horizontalBoost
    
    this.isTapping = false
  }

  handleGameOverInput(onRestart: () => void): void {
    this.scene.input.once('pointerdown', onRestart)
  }

  destroy(): void {
    this.scene.input.removeAllListeners()
  }
}