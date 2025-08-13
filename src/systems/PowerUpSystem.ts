import { PowerUp, PowerUpType, ShieldPowerUp } from '../objects/PowerUp'
import { Basketball } from '../objects/Basketball'

export class PowerUpSystem {
  private scene: Phaser.Scene
  private basketball: Basketball
  private activePowerUps: Map<PowerUpType, PowerUp> = new Map()
  
  // Power-up collection sprites
  private powerUpSprites: Phaser.GameObjects.Sprite[] = []

  constructor(scene: Phaser.Scene, basketball: Basketball) {
    this.scene = scene
    this.basketball = basketball
    this.createPowerUpTextures()
  }

  private createPowerUpTextures(): void {
    // Create shield power-up collection sprite texture
    const graphics = this.scene.add.graphics()
    
    // Shield icon - hexagonal shape with inner design
    graphics.fillStyle(0x00ffff, 1) // Cyan
    graphics.lineStyle(2, 0xffffff, 1) // White border
    
    // Hexagon shape
    const points = []
    const radius = 20
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3
      points.push(radius * Math.cos(angle), radius * Math.sin(angle))
    }
    graphics.fillPoints(points, true)
    graphics.strokePoints(points, true)
    
    // Inner shield symbol
    graphics.lineStyle(3, 0xffffff, 1)
    graphics.strokeCircle(0, 0, 12)
    graphics.strokeCircle(0, 0, 8)
    
    graphics.generateTexture('shield-powerup', 44, 44)
    graphics.destroy()
  }

  public createPowerUpCollectible(x: number, y: number, type: PowerUpType): Phaser.GameObjects.Sprite {
    let textureKey = ''
    
    switch (type) {
      case PowerUpType.SHIELD:
        textureKey = 'shield-powerup'
        break
      default:
        textureKey = 'shield-powerup'
    }

    const powerUpSprite = this.scene.add.sprite(x, y, textureKey)
    powerUpSprite.setDepth(3) // Above rings, below UI
    powerUpSprite.setData('powerUpType', type)
    
    // Add floating animation
    this.scene.tweens.add({
      targets: powerUpSprite,
      y: y - 10,
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    })
    
    // Add rotation animation
    this.scene.tweens.add({
      targets: powerUpSprite,
      rotation: Math.PI * 2,
      duration: 2000,
      repeat: -1,
      ease: 'Linear'
    })
    
    // Add glow effect
    this.scene.tweens.add({
      targets: powerUpSprite,
      alpha: 0.6,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Power2'
    })

    this.powerUpSprites.push(powerUpSprite)
    return powerUpSprite
  }

  public collectPowerUp(powerUpSprite: Phaser.GameObjects.Sprite): void {
    const type = powerUpSprite.getData('powerUpType') as PowerUpType
    
    // Create collection effect
    this.createCollectionEffect(powerUpSprite.x, powerUpSprite.y)
    
    // Remove from tracking array
    const index = this.powerUpSprites.indexOf(powerUpSprite)
    if (index > -1) {
      this.powerUpSprites.splice(index, 1)
    }
    
    // Destroy the collectible sprite
    powerUpSprite.destroy()
    
    // Activate the power-up
    this.activatePowerUp(type)
  }

  private createCollectionEffect(x: number, y: number): void {
    // Create sparkle effect when collecting power-up
    const particles = this.scene.add.particles(x, y, 'fire', {
      speed: { min: 50, max: 100 },
      scale: { start: 0.3, end: 0 },
      blendMode: 'ADD',
      tint: 0x00ffff,
      lifespan: 600,
      quantity: 15
    })

    // Clean up particles after animation
    this.scene.time.delayedCall(800, () => {
      particles.destroy()
    })
  }

  private activatePowerUp(type: PowerUpType): void {
    let powerUp: PowerUp

    switch (type) {
      case PowerUpType.SHIELD:
        // Deactivate existing shield if active
        if (this.activePowerUps.has(PowerUpType.SHIELD)) {
          this.activePowerUps.get(PowerUpType.SHIELD)?.deactivate()
        }
        powerUp = new ShieldPowerUp(this.scene, this.basketball)
        break
      default:
        return
    }

    this.activePowerUps.set(type, powerUp)
    powerUp.activate()
  }

  public update(): void {
    const currentTime = this.scene.time.now

    // Update all active power-ups
    for (const [type, powerUp] of this.activePowerUps.entries()) {
      const stillActive = powerUp.update(currentTime)
      
      if (!stillActive) {
        this.activePowerUps.delete(type)
      }
    }
  }

  public isShieldActive(): boolean {
    const shield = this.activePowerUps.get(PowerUpType.SHIELD)
    return shield ? shield.isActive : false
  }

  public getShieldRemainingTime(): number {
    const shield = this.activePowerUps.get(PowerUpType.SHIELD)
    return shield ? shield.getRemainingTime(this.scene.time.now) : 0
  }

  public checkPowerUpCollision(basketball: Basketball): void {
    this.powerUpSprites.forEach(powerUpSprite => {
      if (!powerUpSprite.active) return

      const distance = Phaser.Math.Distance.Between(
        basketball.x,
        basketball.y,
        powerUpSprite.x,
        powerUpSprite.y
      )

      // Collection radius - slightly larger than basketball
      const collectionRadius = 50

      if (distance < collectionRadius) {
        this.collectPowerUp(powerUpSprite)
      }
    })
  }

  public cleanup(): void {
    // Clean up all power-up sprites
    this.powerUpSprites.forEach(sprite => {
      if (sprite.active) {
        sprite.destroy()
      }
    })
    this.powerUpSprites = []

    // Deactivate all power-ups
    for (const powerUp of this.activePowerUps.values()) {
      powerUp.deactivate()
    }
    this.activePowerUps.clear()
  }

  public destroy(): void {
    this.cleanup()
  }
}