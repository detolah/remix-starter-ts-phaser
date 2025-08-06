import { Ring } from '../types/GameTypes'
import { RingConstants } from '../config/GameConstants'

export class BasketballRing {
  private data: Ring
  private rimThickness: number = RingConstants.rimThickness

  constructor(scene: Phaser.Scene, x: number, y: number, color: number = 0xffffff, shouldTilt: boolean = false) {
    const ring = scene.add.graphics()
    
    // Generate inclination angle based on shouldTilt parameter
    let rotationRadians = 0
    if (shouldTilt) {
      const inclinationDegrees = Phaser.Math.Between(
        RingConstants.minInclinationAngle, 
        RingConstants.maxInclinationAngle
      )
      rotationRadians = Phaser.Math.DegToRad(inclinationDegrees)
    }
    
    this.createRingVisual(ring, x, y, color, rotationRadians)
    
    this.data = {
      sprite: ring,
      x: x,
      y: y,
      outerRadius: RingConstants.ellipseWidth / 2, // Use half of ellipse width for collision
      innerRadius: RingConstants.ellipseWidth / 2 - RingConstants.rimThickness, // Inner collision boundary
      passed: false,
      missed: false,
      rotation: rotationRadians
    }
  }

  private createRingVisual(ring: Phaser.GameObjects.Graphics, x: number, y: number, color: number, rotation: number): void {
    ring.clear()
    
    // Save the current transformation state
    ring.save()
    
    // Apply rotation around the ring center
    ring.translateCanvas(x, y)
    ring.rotateCanvas(rotation)
    ring.translateCanvas(-x, -y)
    
    // Draw the elliptical rim with thick outline
    ring.lineStyle(this.rimThickness, color)
    ring.strokeEllipse(x, y, RingConstants.ellipseWidth, RingConstants.ellipseHeight)
    
    // Add inner shadow/depth effect for a more 3D appearance
    ring.lineStyle(this.rimThickness * 0.4, 0x000000, 0.3)
    ring.strokeEllipse(
      x, 
      y, 
      RingConstants.ellipseWidth - this.rimThickness, 
      RingConstants.ellipseHeight - this.rimThickness * 0.5
    )
    
    // Restore the transformation state
    ring.restore()
  }

  updateColor(color: number): void {
    this.createRingVisual(this.data.sprite, this.data.x, this.data.y, color, this.data.rotation)
  }

  get sprite(): Phaser.GameObjects.Graphics {
    return this.data.sprite
  }

  get x(): number {
    return this.data.x
  }

  get y(): number {
    return this.data.y
  }

  get outerRadius(): number {
    return this.data.outerRadius
  }

  get innerRadius(): number {
    return this.data.innerRadius
  }

  get ellipseWidth(): number {
    return RingConstants.ellipseWidth
  }

  get ellipseHeight(): number {
    return RingConstants.ellipseHeight
  }

  get rotation(): number {
    return this.data.rotation
  }

  get passed(): boolean {
    return this.data.passed
  }

  set passed(value: boolean) {
    this.data.passed = value
  }

  get missed(): boolean {
    return this.data.missed
  }

  set missed(value: boolean) {
    this.data.missed = value
  }

  getData(): Ring {
    return this.data
  }

  destroy(): void {
    this.data.sprite.destroy()
  }
}