import { BasketballRing } from '../objects/BasketballRing'
import { ScoringSystem } from './ScoringSystem'
import GameConstants, { RingConstants } from '../config/GameConstants'

export class RingManager {
  private rings: BasketballRing[] = []
  private scene: Phaser.Scene
  private scoringSystem: ScoringSystem
  private nextRingX: number = 800 // Position for next ring generation
  private ringSpacing: number = RingConstants.spacing
  private ringCount: number = 0 // Track total rings created

  constructor(scene: Phaser.Scene, scoringSystem: ScoringSystem) {
    this.scene = scene
    this.scoringSystem = scoringSystem
    this.createInitialRings()
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
    
    const ring = new BasketballRing(this.scene, x, y, color, shouldTilt)
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
    this.rings.forEach(ring => {
      if (!ring.passed) {
        ring.updateColor(color)
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