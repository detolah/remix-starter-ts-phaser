export interface Basketball {
  sprite: Phaser.GameObjects.Arc
  velocityX: number
  velocityY: number
  radius: number
  angularVelocity: number
}

export interface Ring {
  sprite: Phaser.GameObjects.Graphics
  x: number
  y: number
  outerRadius: number
  innerRadius: number
  passed: boolean
  missed: boolean
  rotation: number // Inclination angle in radians
}

export interface CollisionResult {
  type: 'perfect' | 'regular' | 'collision' | 'none'
  points: number
}


export interface ScoreData {
  score: number
  perfectStreak: number
  currentMultiplier: number
}