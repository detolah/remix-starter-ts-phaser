import { Basketball as BasketballType } from '../types/GameTypes'
import GameSettings from '../config/GameSettings'

export class Basketball {
  private data: BasketballType

  constructor(scene: Phaser.Scene, x: number = 150, y: number = GameSettings.canvas.height / 2) {
    const radius = 45 // Increased size from 30 to 45
    const ball = scene.add.circle(x, y, radius, 0xff8c42)
    ball.setStrokeStyle(3, 0x000000)
    
    this.data = {
      sprite: ball,
      velocityX: 0, // Start stationary
      velocityY: 0,
      radius: radius,
      angularVelocity: 0
    }
  }

  get sprite(): Phaser.GameObjects.Arc {
    return this.data.sprite
  }

  get velocityX(): number {
    return this.data.velocityX
  }

  set velocityX(value: number) {
    this.data.velocityX = value
  }

  get velocityY(): number {
    return this.data.velocityY
  }

  set velocityY(value: number) {
    this.data.velocityY = value
  }

  get radius(): number {
    return this.data.radius
  }

  get angularVelocity(): number {
    return this.data.angularVelocity
  }

  set angularVelocity(value: number) {
    this.data.angularVelocity = value
  }

  get x(): number {
    return this.data.sprite.x
  }

  get y(): number {
    return this.data.sprite.y
  }

  getData(): BasketballType {
    return this.data
  }
}