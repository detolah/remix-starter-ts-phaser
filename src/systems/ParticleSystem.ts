export class ParticleSystem {
  private scene: Phaser.Scene
  private fireEmitters: Map<string, Phaser.GameObjects.Particles.ParticleEmitter> = new Map()
  private ballFireEmitter: Phaser.GameObjects.Particles.ParticleEmitter | null = null
  private ringEffects: Map<string, Phaser.GameObjects.Graphics[]> = new Map()

  constructor(scene: Phaser.Scene) {
    this.scene = scene
  }

  createBallFireEffect(ball: Phaser.GameObjects.Arc, streakLevel: number): void {
    // Remove existing ball fire effect
    this.removeBallFireEffect()

    if (streakLevel < 2) return // Only show fire for streaks of 2+

    // Create fire effect that follows the ball
    const fireColors = this.getStreakFireColors(streakLevel)
    const intensity = Math.min(streakLevel, 5)

    this.ballFireEmitter = this.scene.add.particles(0, 0, 'fire', {
      speed: { min: 60 + (intensity * 20), max: 150 + (intensity * 30) },
      scale: { start: 1.0 + (intensity * 0.2), end: 0 }, // Much larger scale
      lifespan: 600 + (intensity * 100), // Longer lifespan
      quantity: 3 + Math.floor(intensity / 1.5), // More particles
      frequency: Math.max(50 - (intensity * 8), 20), // More frequent
      alpha: { start: 1.0, end: 0 }, // Full opacity
      tint: fireColors,
      emitZone: { 
        type: 'random',
        source: new Phaser.Geom.Circle(0, 0, 80) // Larger area around ball
      },
      gravityY: -80 - (intensity * 20), // Stronger upward movement
      angle: { min: -180, max: 0 }, // Wider flame spread
      accelerationX: { min: -25, max: 25 },
      accelerationY: { min: -50, max: -20 },
      follow: ball // Follow the ball!
    })
  }

  removeBallFireEffect(): void {
    if (this.ballFireEmitter) {
      this.ballFireEmitter.stop()
      this.scene.time.delayedCall(500, () => {
        if (this.ballFireEmitter) {
          this.ballFireEmitter.destroy()
          this.ballFireEmitter = null
        }
      })
    }
  }

  createRingSparkleEffect(ring: { x: number, y: number, outerRadius: number }, color: number): void {
    const ringKey = `ring_${ring.x}_${ring.y}`
    
    // Remove existing ring effects
    this.removeRingEffects(ringKey)

    const sparkleEffects: Phaser.GameObjects.Graphics[] = []
    const numSparkles = 8
    const ringRadius = ring.outerRadius

    // Create much larger sparkles around the ring
    for (let i = 0; i < numSparkles; i++) {
      const angle = (i / numSparkles) * Math.PI * 2
      const sparkleX = ring.x + Math.cos(angle) * (ringRadius + 20) // Further from ring
      const sparkleY = ring.y + Math.sin(angle) * (ringRadius * 0.4) // More elliptical

      const sparkle = this.scene.add.graphics()
      sparkle.fillStyle(color, 1)
      sparkle.fillStar(sparkleX, sparkleY, 6, 8, 16, 0) // Much larger stars
      sparkle.setAlpha(0)
      sparkle.setScale(2.0) // Start larger

      sparkleEffects.push(sparkle)

      // More dramatic animation
      this.scene.tweens.add({
        targets: sparkle,
        alpha: 1,
        scaleX: 3.0, // Much bigger scale
        scaleY: 3.0,
        duration: 400,
        delay: i * 80,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      })
    }

    // Store sparkle effects
    this.ringEffects.set(ringKey, sparkleEffects)
  }

  removeRingEffects(ringKey: string): void {
    const effects = this.ringEffects.get(ringKey)
    if (effects) {
      effects.forEach(effect => {
        this.scene.tweens.killTweensOf(effect)
        effect.destroy()
      })
      this.ringEffects.delete(ringKey)
    }
  }

  private getStreakFireColors(streakLevel: number): number[] {
    switch (streakLevel) {
      case 1:
        return [0xff4500, 0xff6347, 0xff8c00] // Orange-red flames
      case 2:
        return [0x3a86ff, 0x4dabf7, 0x74c0fc] // Blue flames
      case 3:
        return [0x9d4edd, 0xb084cc, 0xc77dff] // Purple flames
      case 4:
        return [0xff6b35, 0xff8500, 0xffa94d] // Bright orange flames
      case 5:
        return [0xffd700, 0xffed4a, 0xfff3cd] // Gold flames
      default:
        return [0xff4500, 0xff6347, 0xffd700] // Default fire colors
    }
  }

  createPerfectHoopEffect(x: number, y: number): void {
    // Create a downward trail effect when ball goes through hoop
    const perfectEmitter = this.scene.add.particles(x, y, 'fire', {
      speed: { min: 50, max: 120 }, // Faster particles
      scale: { start: 1.2, end: 0 }, // Much larger scale
      lifespan: 1200, // Longer lasting
      quantity: 5, // More particles
      frequency: 20, // More frequent
      alpha: { start: 1, end: 0 },
      tint: [0xffd700, 0xffed4a, 0xffffff], // Golden perfect colors
      emitZone: { 
        type: 'random',
        source: new Phaser.Geom.Circle(0, 0, 40) // Larger area
      },
      gravityY: 150, // Stronger downward movement
      angle: { min: 45, max: 135 }, // Wider downward spread
      accelerationY: 80
    })

    // Store emitter
    const emitterKey = `perfect_hoop_${Date.now()}_${Math.random()}`
    this.fireEmitters.set(emitterKey, perfectEmitter)

    // Stop after short duration
    this.scene.time.delayedCall(1200, () => {
      perfectEmitter.stop()
      this.scene.time.delayedCall(1000, () => {
        perfectEmitter.destroy()
        this.fireEmitters.delete(emitterKey)
      })
    })
  }

  createBallColorChangeEffect(ball: Phaser.GameObjects.Arc, newColor: number): void {
    // Create a brief burst effect when ball changes color
    const burstEmitter = this.scene.add.particles(0, 0, 'fire', {
      speed: { min: 120, max: 250 }, // Much faster burst
      scale: { start: 1.0, end: 0 }, // Larger particles
      lifespan: 500, // Longer visible
      quantity: 12, // Double the particles
      frequency: -1, // Burst mode
      alpha: { start: 1, end: 0 },
      tint: [newColor, this.lightenColor(newColor, 0.4), 0xffffff],
      emitZone: { 
        type: 'random',
        source: new Phaser.Geom.Circle(0, 0, 80) // Larger burst area
      },
      angle: { min: 0, max: 360 },
      gravityY: 0,
      follow: ball
    })

    // Emit larger burst
    burstEmitter.explode(12)
    
    this.scene.time.delayedCall(500, () => {
      burstEmitter.destroy()
    })
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

  destroy(): void {
    // Clean up ball fire effect
    this.removeBallFireEffect()
    
    // Clean up all other emitters
    this.fireEmitters.forEach((emitter) => {
      emitter.destroy()
    })
    this.fireEmitters.clear()
    
    // Clean up ring effects
    this.ringEffects.forEach((effects) => {
      effects.forEach(effect => {
        this.scene.tweens.killTweensOf(effect)
        effect.destroy()
      })
    })
    this.ringEffects.clear()
  }
}