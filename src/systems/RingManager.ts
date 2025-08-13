import { BasketballRing } from '../objects/BasketballRing'
import { ScoringSystem } from './ScoringSystem'
import { VisualEffectSystem } from './VisualEffectSystem'
import { PowerUpSystem } from './PowerUpSystem'
import { PowerUpType } from '../objects/PowerUp'
import GameConstants, { RingConstants } from '../config/GameConstants'

export class RingManager {
  private rings: BasketballRing[] = []
  private scene: Phaser.Scene
  private scoringSystem: ScoringSystem
  private visualEffectSystem: VisualEffectSystem | null = null
  private powerUpSystem: PowerUpSystem | null = null
  private nextRingX: number = 800 // Position for next ring generation
  private ringSpacing: number = RingConstants.spacing
  private ringCount: number = 0 // Track total rings created

  constructor(scene: Phaser.Scene, scoringSystem: ScoringSystem) {
    this.scene = scene
    this.scoringSystem = scoringSystem
    this.createInitialRings()
  }

  setParticleSystem(visualEffectSystem: VisualEffectSystem): void {
    this.visualEffectSystem = visualEffectSystem
  }

  setPowerUpSystem(powerUpSystem: PowerUpSystem): void {
    this.powerUpSystem = powerUpSystem
  }

  private createInitialRings(): void {
    // Create first few rings at proper intervals
    for (let i = 0; i < 3; i++) {
      const x = this.nextRingX + (i * this.ringSpacing)
      this.createRing(x, this.getRandomRingY())
    }
    this.nextRingX += (3 * this.ringSpacing) // Update next ring position
  }

  private getRandomRingY(): number {
    return Phaser.Math.Between(RingConstants.minY, RingConstants.maxY)
  }

  private createRing(x: number, y: number): void {
    const color = this.scoringSystem.getRingColor()
    
    // Determine if this ring should be tilted
    let shouldTilt = false
    if (this.ringCount >= RingConstants.minRingsBeforeTilt) {
      shouldTilt = Math.random() < RingConstants.tiltProbability
    }
    
    // Determine if this should be a bonus ring with power-up
    let powerUpType: PowerUpType | undefined = undefined
    if (this.ringCount > 5) { // Don't put power-ups in first few rings
      // 15% chance for a bonus ring (approximately every 6-7 rings)
      if (Math.random() < 0.15) {
        powerUpType = PowerUpType.SHIELD // Only shield for now
      }
    }
    
    const ring = new BasketballRing(this.scene, x, y, color, shouldTilt, powerUpType)
    this.rings.push(ring)
    this.ringCount++
  }

  generateNewRings(cameraX: number): void {
    // Generate new rings ahead of the camera view
    const cameraRight = cameraX + GameConstants.canvas.width
    
    // Generate rings when camera approaches the next ring position
    while (this.nextRingX < cameraRight + RingConstants.generationDistance) {
      this.createRing(this.nextRingX, this.getRandomRingY())
      this.nextRingX += this.ringSpacing
    }
  }

  cleanupOldRings(cameraX: number): void {
    // Clean up rings that are far behind the camera
    const cleanupThreshold = cameraX - RingConstants.cleanupDistance
    
    this.rings = this.rings.filter(ring => {
      if (ring.x < cleanupThreshold) {
        ring.destroy()
        return false
      }
      return true
    })
  }

  updateRingColors(): void {
    const color = this.scoringSystem.getRingColor()
    const streak = this.scoringSystem.perfectStreak
    
    this.rings.forEach(ring => {
      if (!ring.passed) {
        ring.updateColor(color)
        
        // Add glow effects for rings when on a streak
        if (streak >= 2 && this.visualEffectSystem) {
          this.visualEffectSystem.createRingGlowEffect(
            { x: ring.x, y: ring.y, outerRadius: ring.outerRadius },
            color,
            streak
          )
        }
      }
    })
  }

  getRings(): BasketballRing[] {
    return this.rings
  }

  destroy(): void {
    this.rings.forEach(ring => ring.destroy())
    this.rings = []
  }
}