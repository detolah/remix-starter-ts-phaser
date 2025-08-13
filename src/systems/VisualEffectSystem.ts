export class VisualEffectSystem {
  private scene: Phaser.Scene
  private ballFireAura: Phaser.GameObjects.Graphics | null = null
  private ballFireParticles: Phaser.GameObjects.Particles.ParticleEmitter | null = null
  private ringGlowEffects: Map<string, Phaser.GameObjects.Graphics[]> = new Map()

  constructor(scene: Phaser.Scene) {
    this.scene = scene
  }

  // Create a persistent fire aura around the ball
  createBallFireAura(ball: Phaser.GameObjects.Arc, streakLevel: number): void {
    this.removeBallFireAura()

    if (streakLevel < 2) return

    const fireColor = this.getStreakFireColor(streakLevel)
    const intensity = Math.min(streakLevel, 5)
    
    // No fire aura rings - removed per user request

    // Add flare-style fire particles like Phaser examples
    this.ballFireParticles = this.scene.add.particles(0, 0, 'fire', {
      color: this.getFlameColors(streakLevel),
      colorEase: 'quad.out',
      lifespan: 1200 + (intensity * 200),
      angle: { min: -160, max: -20 },
      scale: { start: 0.8 + (intensity * 0.1), end: 0, ease: 'sine.out' },
      speed: { min: 80 + (intensity * 20), max: 150 + (intensity * 30) },
      quantity: 2 + Math.floor(intensity / 2),
      frequency: 100 - (intensity * 10),
      blendMode: 'ADD', // This makes the fire glow!
      emitZone: { 
        type: 'random',
        source: new Phaser.Geom.Circle(0, 0, 100 + (intensity * 20))
      },
      gravityY: -60 - (intensity * 15),
      follow: ball
    })
  }

  updateBallFirePosition(ball: Phaser.GameObjects.Arc): void {
    // No fire aura to update - only particles which follow automatically
  }

  removeBallFireAura(): void {
    if (this.ballFireAura) {
      this.scene.tweens.killTweensOf(this.ballFireAura)
      this.ballFireAura.destroy()
      this.ballFireAura = null
    }
    
    if (this.ballFireParticles) {
      this.ballFireParticles.stop()
      this.scene.time.delayedCall(500, () => {
        if (this.ballFireParticles) {
          this.ballFireParticles.destroy()
          this.ballFireParticles = null
        }
      })
    }
  }

  // Create persistent glow effects around rings
  createRingGlowEffect(ring: { x: number, y: number, outerRadius: number }, color: number, streakLevel: number): void {
    const ringKey = `ring_${ring.x}_${ring.y}`
    this.removeRingGlowEffects(ringKey)

    const glowEffects: Phaser.GameObjects.Graphics[] = []
    const intensity = Math.min(streakLevel, 5)

    // Create multiple glow rings around the ring
    const mainGlow = this.scene.add.graphics()
    
    // Outer glow
    mainGlow.lineStyle(20 + (intensity * 5), color, 0.3)
    mainGlow.strokeEllipse(ring.x, ring.y, ring.outerRadius * 2.5, ring.outerRadius * 0.8)
    
    // Middle glow
    mainGlow.lineStyle(15 + (intensity * 3), color, 0.5)
    mainGlow.strokeEllipse(ring.x, ring.y, ring.outerRadius * 2.2, ring.outerRadius * 0.7)
    
    // Inner glow
    mainGlow.lineStyle(10 + (intensity * 2), color, 0.7)
    mainGlow.strokeEllipse(ring.x, ring.y, ring.outerRadius * 2.0, ring.outerRadius * 0.6)

    glowEffects.push(mainGlow)

    // Create pulsing animation
    this.scene.tweens.add({
      targets: mainGlow,
      alpha: { from: 1, to: 0.3 },
      scaleX: { from: 1, to: 1.2 },
      scaleY: { from: 1, to: 1.2 },
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    })

    // Sparkle stars removed per user request

    this.ringGlowEffects.set(ringKey, glowEffects)
  }

  removeRingGlowEffects(ringKey: string): void {
    const effects = this.ringGlowEffects.get(ringKey)
    if (effects) {
      effects.forEach(effect => {
        this.scene.tweens.killTweensOf(effect)
        effect.destroy()
      })
      this.ringGlowEffects.delete(ringKey)
    }
  }

  // Create perfect hoop effect (text + particles only)
  createPerfectHoopExplosion(x: number, y: number): void {
    // Add text effect
    const perfectText = this.scene.add.text(x, y - 50, 'PERFECT!', {
      fontSize: '32px',
      color: '#FFD700',
      stroke: '#FFF',
      strokeThickness: 3,
      align: 'center'
    })
    perfectText.setOrigin(0.5)
    perfectText.setScale(0)

    this.scene.tweens.add({
      targets: perfectText,
      scaleX: 1.5,
      scaleY: 1.5,
      duration: 300,
      ease: 'Back.easeOut'
    })

    this.scene.tweens.add({
      targets: perfectText,
      alpha: 0,
      y: y - 100,
      duration: 1000,
      delay: 500,
      ease: 'Power2',
      onComplete: () => perfectText.destroy()
    })

    // Add flare-style particle shower
    const particles = this.scene.add.particles(x, y, 'fire', {
      color: [0xfacc22, 0xf89800, 0xf83600, 0xffd700],
      colorEase: 'quad.out',
      speed: { min: 150, max: 300 },
      scale: { start: 1.2, end: 0, ease: 'sine.out' },
      lifespan: 1500,
      quantity: 20,
      frequency: -1,
      blendMode: 'ADD',
      angle: { min: 0, max: 360 },
      gravityY: 250
    })

    particles.explode(20, x, y)
    
    this.scene.time.delayedCall(1200, () => {
      particles.destroy()
    })
  }

  private getStreakFireColor(streakLevel: number): number {
    switch (streakLevel) {
      case 2: return 0x3a86ff // Blue
      case 3: return 0x9d4edd // Purple  
      case 4: return 0xff6b35 // Orange
      case 5: return 0xffd700 // Gold
      default: return 0xff4500 // Default fire
    }
  }

  private getFlameColors(streakLevel: number): number[] {
    switch (streakLevel) {
      case 2: return [0x96e0da, 0x6bb6ff, 0x3a86ff, 0x1c5aa3] // Blue flames
      case 3: return [0xd8b4fe, 0xc084fc, 0x9d4edd, 0x7c2d92] // Purple flames
      case 4: return [0xfeb2a8, 0xff8500, 0xff6b35, 0xd63031] // Orange flames  
      case 5: return [0xffeaa7, 0xfdcb6e, 0xffd700, 0xe17055] // Gold flames
      default: return [0xfacc22, 0xf89800, 0xf83600, 0x9f0404] // Default fire colors
    }
  }

  // Create collision feedback effect
  createRimCollisionEffect(x: number, y: number, impactSpeed: number, isLeftEdge: boolean): void {
    // Create subtle impact flash
    const impactFlash = this.scene.add.graphics()
    const flashSize = Math.min(impactSpeed * 0.2, 20)
    
    impactFlash.fillStyle(0xffffff, 0.5)
    impactFlash.fillCircle(x, y, flashSize)
    impactFlash.setBlendMode(Phaser.BlendModes.ADD)
    
    // Quick flash animation
    this.scene.tweens.add({
      targets: impactFlash,
      alpha: 0,
      scaleX: 1.5,
      scaleY: 1.5,
      duration: 150,
      ease: 'Power2.easeOut',
      onComplete: () => impactFlash.destroy()
    })
    
    // Create minimal collision sparks
    const sparkColors = [0xffffff, 0xffffff]
    const sparkCount = Math.min(Math.floor(impactSpeed * 0.05), 3)
    
    for (let i = 0; i < sparkCount; i++) {
      const spark = this.scene.add.graphics()
      const sparkColor = sparkColors[Math.floor(Math.random() * sparkColors.length)]
      
      spark.fillStyle(sparkColor, 0.8)
      spark.fillCircle(0, 0, 2)
      spark.setPosition(x, y)
      
      // Small spark direction with bias toward collision side
      const baseAngle = isLeftEdge ? Math.PI : 0 // Away from collision
      const angleVariation = Math.PI / 4 // 45-degree spread
      const angle = baseAngle + (Math.random() - 0.5) * angleVariation
      
      const distance = 20 + Math.random() * 20
      
      const targetX = x + Math.cos(angle) * distance
      const targetY = y + Math.sin(angle) * distance
      
      this.scene.tweens.add({
        targets: spark,
        x: targetX,
        y: targetY,
        alpha: 0,
        duration: 200,
        ease: 'Power2.easeOut',
        onComplete: () => spark.destroy()
      })
    }
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
    this.removeBallFireAura()
    
    this.ringGlowEffects.forEach((effects, key) => {
      this.removeRingGlowEffects(key)
    })
    this.ringGlowEffects.clear()
  }
}