export enum PowerUpType {
  SHIELD = 'shield'
}

export abstract class PowerUp {
  public type: PowerUpType
  public duration: number
  public isActive: boolean = false
  public startTime: number = 0

  constructor(type: PowerUpType, duration: number) {
    this.type = type
    this.duration = duration
  }

  abstract activate(): void
  abstract deactivate(): void
  abstract update(currentTime: number): boolean // Returns true if still active

  public getRemainingTime(currentTime: number): number {
    if (!this.isActive) return 0
    return Math.max(0, this.duration - (currentTime - this.startTime))
  }
}

export class ShieldPowerUp extends PowerUp {
  private scene: Phaser.Scene
  private basketball: { sprite: Phaser.GameObjects.Graphics, x: number, y: number }
  private shieldSprite?: Phaser.GameObjects.Sprite

  constructor(scene: Phaser.Scene, basketball: { sprite: Phaser.GameObjects.Graphics, x: number, y: number }) {
    super(PowerUpType.SHIELD, 15000) // 15 seconds
    this.scene = scene
    this.basketball = basketball
  }

  activate(): void {
    if (this.isActive) return

    this.isActive = true
    this.startTime = this.scene.time.now
    
    // Create shield visual effect
    this.createShieldEffect()
  }

  deactivate(): void {
    if (!this.isActive) return

    this.isActive = false
    this.removeShieldEffect()
  }

  update(currentTime: number): boolean {
    if (!this.isActive) return false

    const elapsed = currentTime - this.startTime
    if (elapsed >= this.duration) {
      this.deactivate()
      return false
    }

    // Update shield visual position to follow basketball
    this.updateShieldPosition()
    
    // Make shield pulse more rapidly as it's about to expire
    this.updateShieldPulse(elapsed)

    return true
  }

  private createShieldEffect(): void {
    // Create a circular shield sprite around the basketball
    const graphics = this.scene.add.graphics()
    graphics.lineStyle(6, 0x00ffff, 0.8) // Cyan color with transparency
    graphics.strokeCircle(0, 0, 45) // Slightly larger than basketball
    
    // Add inner glow effect
    graphics.lineStyle(3, 0xffffff, 0.6)
    graphics.strokeCircle(0, 0, 42)
    
    graphics.generateTexture('shield', 90, 90)
    graphics.destroy()

    this.shieldSprite = this.scene.add.sprite(this.basketball.x, this.basketball.y, 'shield')
    this.shieldSprite.setDepth(5) // Above basketball but below UI
    this.shieldSprite.setAlpha(0.7)
    
    // Add subtle rotation animation
    this.scene.tweens.add({
      targets: this.shieldSprite,
      rotation: Math.PI * 2,
      duration: 3000,
      repeat: -1,
      ease: 'Linear'
    })
  }

  private removeShieldEffect(): void {
    if (this.shieldSprite) {
      // Fade out animation
      this.scene.tweens.add({
        targets: this.shieldSprite,
        alpha: 0,
        scale: 1.5,
        duration: 300,
        ease: 'Power2',
        onComplete: () => {
          this.shieldSprite?.destroy()
          this.shieldSprite = undefined
        }
      })
    }
  }

  private updateShieldPosition(): void {
    if (this.shieldSprite && this.basketball.sprite) {
      this.shieldSprite.x = this.basketball.sprite.x
      this.shieldSprite.y = this.basketball.sprite.y
    }
  }

  private updateShieldPulse(elapsed: number): void {
    if (!this.shieldSprite) return

    const remaining = this.duration - elapsed
    
    // Pulse more rapidly when shield is about to expire (last 3 seconds)
    if (remaining <= 3000) {
      const pulseSpeed = 200 // Faster pulse
      const alpha = 0.3 + 0.4 * Math.sin(elapsed / pulseSpeed)
      this.shieldSprite.setAlpha(alpha)
    } else {
      // Normal gentle pulse
      const pulseSpeed = 800
      const alpha = 0.5 + 0.2 * Math.sin(elapsed / pulseSpeed)
      this.shieldSprite.setAlpha(alpha)
    }
  }
}