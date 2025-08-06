import { Basketball } from '../objects/Basketball'

export class CameraSystem {
  private camera: Phaser.Cameras.Scene2D.Camera
  private scene: Phaser.Scene
  private basketball: Basketball
  private gameplayWidth: number = 1000 // Width of gameplay area
  private cameraOffsetX: number = 0 // Track camera's horizontal offset

  constructor(scene: Phaser.Scene, basketball: Basketball) {
    this.camera = scene.cameras.main
    this.scene = scene
    this.basketball = basketball
    this.setupCamera()
  }

  private setupCamera(): void {
    // Camera will move horizontally but keep the gameplay area centered
    this.camera.stopFollow()
    this.updateCameraPosition()
  }

  update(): void {
    this.updateCameraPosition()
  }

  private updateCameraPosition(): void {
    // Calculate camera X based on ball's progress, keeping gameplay area centered
    const ballX = this.basketball.x
    
    // Camera moves with ball but keeps the ball in the left portion of the screen
    // This creates horizontal progression while maintaining the gameplay focus
    const targetCameraX = Math.max(0, ballX - 300) // Keep ball 300px from left edge
    
    // Smooth camera movement
    const currentCameraX = this.camera.scrollX
    const lerpFactor = 0.05
    this.cameraOffsetX = currentCameraX + (targetCameraX - currentCameraX) * lerpFactor
    
    this.camera.setScroll(this.cameraOffsetX, 0)
  }

  get scrollX(): number {
    return this.camera.scrollX
  }

  getCamera(): Phaser.Cameras.Scene2D.Camera {
    return this.camera
  }

  // Get the center X of the current gameplay area
  getGameplayAreaCenterX(): number {
    return this.scrollX + this.gameplayWidth / 2
  }
}