import { Ring } from '../types/GameTypes'
import { RingConstants } from '../config/GameConstants'
import { PowerUpType } from './PowerUp'

export class BasketballRing {
  private data: Ring
  private rimThickness: number = RingConstants.rimThickness
  private _hasPowerUp: boolean = false
  private _powerUpType?: PowerUpType
  private _powerUpSprite?: Phaser.GameObjects.Sprite

  constructor(scene: Phaser.Scene, x: number, y: number, color: number = 0xffffff, shouldTilt: boolean = false, powerUpType?: PowerUpType) {
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
    
    // Set up power-up if provided
    if (powerUpType) {
      this._hasPowerUp = true
      this._powerUpType = powerUpType
      this.createBonusRingEffect(ring, x, y, color, rotationRadians)
    }
    
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
    
    const ellipseWidth = RingConstants.ellipseWidth
    const ellipseHeight = RingConstants.ellipseHeight
    const rimThickness = this.rimThickness
    
    // 1. Black outline (outermost)
    ring.lineStyle(6, 0x000000)
    ring.strokeEllipse(x, y, ellipseWidth + 6, ellipseHeight + 3)
    
    // 2. Main ring with gradient effect - darker bottom
    const shadowColor = this.darkenColor(color, 0.3)
    ring.lineStyle(rimThickness, shadowColor)
    ring.strokeEllipse(x, y + 1, ellipseWidth, ellipseHeight)
    
    // 3. Main ring color (lighter top part)
    ring.lineStyle(rimThickness * 0.8, color)
    ring.strokeEllipse(x, y - 1, ellipseWidth, ellipseHeight)
    
    // 4. Inner hole - invisible but collision detection still works
    // (No visual rendering - hole is defined by collision detection only)
    
    // 5. Glossy highlight (small bright spot on top-left)
    ring.fillStyle(0xffffff, 0.9)
    const highlightX = x - ellipseWidth * 0.15
    const highlightY = y - ellipseHeight * 0.3
    ring.fillEllipse(highlightX, highlightY, 12, 6)
    
    // 6. Secondary smaller highlight for extra gloss
    ring.fillStyle(0xffffff, 0.6)
    ring.fillEllipse(highlightX + 8, highlightY + 4, 6, 3)
    
    // Restore the transformation state
    ring.restore()
  }

  private lightenColor(color: number, factor: number): number {
    const r = (color >> 16) & 0xFF
    const g = (color >> 8) & 0xFF
    const b = color & 0xFF
    
    const newR = Math.min(255, Math.floor(r + (255 - r) * factor))
    const newG = Math.min(255, Math.floor(g + (255 - g) * factor))
    const newB = Math.min(255, Math.floor(b + (255 - b) * factor))
    
    return (newR << 16) | (newG << 8) | newB
  }

  private darkenColor(color: number, factor: number): number {
    const r = (color >> 16) & 0xFF
    const g = (color >> 8) & 0xFF
    const b = color & 0xFF
    
    const newR = Math.max(0, Math.floor(r * (1 - factor)))
    const newG = Math.max(0, Math.floor(g * (1 - factor)))
    const newB = Math.max(0, Math.floor(b * (1 - factor)))
    
    return (newR << 16) | (newG << 8) | newB
  }

  private createBonusRingEffect(ring: Phaser.GameObjects.Graphics, x: number, y: number, color: number, rotation: number): void {
    // Add special visual effect for bonus rings
    // Create pulsing outer glow effect
    const scene = ring.scene
    
    // Create glow effect
    const glowGraphics = scene.add.graphics()
    glowGraphics.lineStyle(8, 0xffff00, 0.3) // Yellow glow
    glowGraphics.strokeEllipse(x, y, RingConstants.ellipseWidth + 20, RingConstants.ellipseHeight + 10)
    glowGraphics.setDepth(ring.depth - 1) // Behind the main ring
    
    // Pulsing animation for the glow
    scene.tweens.add({
      targets: glowGraphics,
      alpha: 0.1,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Power2'
    })
    
    // Store reference to clean up later
    ring.setData('bonusGlow', glowGraphics)
  }

  updateColor(color: number): void {
    this.createRingVisual(this.data.sprite, this.data.x, this.data.y, color, this.data.rotation)
    
    // Re-create bonus ring effects if this is a bonus ring
    if (this._hasPowerUp) {
      this.createBonusRingEffect(this.data.sprite, this.data.x, this.data.y, color, this.data.rotation)
    }
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

  get hasPowerUp(): boolean {
    return this._hasPowerUp
  }

  get powerUpType(): PowerUpType | undefined {
    return this._powerUpType
  }

  public consumePowerUp(): PowerUpType | undefined {
    if (!this._hasPowerUp) return undefined
    
    const type = this._powerUpType
    this._hasPowerUp = false
    this._powerUpType = undefined
    
    // Clean up bonus ring visual effects
    const bonusGlow = this.data.sprite.getData('bonusGlow')
    if (bonusGlow) {
      bonusGlow.destroy()
      this.data.sprite.setData('bonusGlow', null)
    }
    
    return type
  }

  getData(): Ring {
    return this.data
  }

  destroy(): void {
    // Clean up bonus ring effects
    const bonusGlow = this.data.sprite.getData('bonusGlow')
    if (bonusGlow) {
      bonusGlow.destroy()
    }
    
    if (this._powerUpSprite) {
      this._powerUpSprite.destroy()
    }
    
    this.data.sprite.destroy()
  }
}