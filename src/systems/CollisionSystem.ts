import { Basketball } from '../objects/Basketball'
import { BasketballRing } from '../objects/BasketballRing'
import { CollisionResult, CollisionData } from '../types/GameTypes'
import { ScoringConstants, PhysicsConstants, CollisionConstants } from '../config/GameConstants'

export class CollisionSystem {
  private visualEffectSystem?: any // Will be injected via setter

  setVisualEffectSystem(visualEffectSystem: any): void {
    this.visualEffectSystem = visualEffectSystem
  }
  
  checkRingEntrance(basketball: Basketball, ring: BasketballRing, currentMultiplier: number): CollisionResult {
    const ball = basketball.getData()
    const ballLeft = ball.sprite.x - ball.radius
    const ballRight = ball.sprite.x + ball.radius
    const ballTop = ball.sprite.y - ball.radius
    const ballBottom = ball.sprite.y + ball.radius
    
    const rimLeft = ring.x - ring.outerRadius
    const rimRight = ring.x + ring.outerRadius
    const rimInnerLeft = ring.x - ring.innerRadius
    const rimInnerRight = ring.x + ring.innerRadius
    const rimY = ring.y
    
    // Check for successful passage through the ring
    if (ballTop <= rimY && ballBottom >= rimY && 
        ballLeft >= rimLeft && ballRight <= rimRight &&
        ball.velocityY > 0) {
      
      const centerDistance = Math.abs(ball.sprite.x - ring.x)
      const perfectZone = ring.outerRadius * ScoringConstants.perfectZonePercentage
      
      if (centerDistance <= perfectZone) {
        return { type: 'perfect', points: ScoringConstants.basePoints * currentMultiplier }
      } else {
        return { type: 'regular', points: ScoringConstants.basePoints }
      }
    }
    
    // Check for outer rim edge collision (ball hits outer edge of ring)
    if (ballBottom >= rimY - CollisionConstants.rimCollisionTolerance && ballTop <= rimY + CollisionConstants.rimCollisionTolerance &&
        (ballLeft < rimLeft || ballRight > rimRight) &&
        Math.abs(ball.sprite.y - rimY) <= ball.radius + CollisionConstants.edgeDetectionBuffer) {
      return { type: 'collision', points: 0 }
    }
    
    return { type: 'none', points: 0 }
  }

  isRingInRange(basketball: Basketball, ring: BasketballRing): boolean {
    const ball = basketball.getData()
    const distance = Phaser.Math.Distance.Between(ball.sprite.x, ball.sprite.y, ring.x, ring.y)
    return distance <= ring.outerRadius + ball.radius + CollisionConstants.ringRangeBuffer
  }

  handleRingEdgeCollision(basketball: Basketball, ring: BasketballRing): void {
    const ball = basketball.getData()
    
    // Determine which side was hit
    const isLeftSide = ball.sprite.x < ring.x
    
    // Simple clean bounce - no complex calculations
    if (isLeftSide) {
      // Hit left side - bounce RIGHT
      ball.velocityX = 200
    } else {
      // Hit right side - bounce LEFT
      ball.velocityX = -200
    }
    
    // Simple upward bounce
    ball.velocityY = -Math.abs(ball.velocityY) * 0.6
    
    // Simple spin
    ball.angularVelocity = isLeftSide ? 3 : -3
  }


}