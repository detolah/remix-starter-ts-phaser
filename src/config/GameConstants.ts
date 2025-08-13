/**
 * Game Constants for Basketball Ring Game
 * Centralized configuration for all game variables and tunable parameters
 * Based on GAMEPLAN.md and CORELOOP.md specifications
 */

export const GameConstants = {
  // Canvas Settings
  canvas: {
    width: 1000,
    height: 1800,
  },

  // Physics Constants
  physics: {
    gravity: 800,
    baseJumpForce: -450,
    maxJumpForce: -650,
    jumpBoostX: 75,
    horizontalSpeed: 200,
    bounceReduction: 0.3,
    velocityDamping: 0.8,
    angularVelocityOnCollision: 2,
  },

  // Basketball Properties
  basketball: {
    radius: 25,
    startX: 150, // Close to left side
    startY: 900, // Center of 1800px canvas
    color: 0xff8c42,
  },

  // Ring System
  rings: {
    spacing: 1200, // Increased spacing for more taps between rings
    minY: 700, // Centered around ball start position (900px)
    maxY: 1100, // Centered around ball start position (900px)
    outerRadius: 150, // ellipseWidth / 2
    innerRadius: 120, // outerRadius - rimThickness
    rimWidth: 100,
    rimThickness: 30, // Increased thickness for more visible rim
    netHeight: 60,
    // Ellipse dimensions for flattened ring appearance
    ellipseWidth: 300, // Horizontal diameter
    ellipseHeight: 60, // Vertical diameter (updated to match visual)
    // Ring inclination for difficulty
    maxInclinationAngle: 25, // Maximum tilt angle in degrees (left/right)
    minInclinationAngle: -25, // Minimum tilt angle in degrees
    tiltProbability: 0.3, // 30% chance (3/10) for tilted rings  
    minRingsBeforeTilt: 5, // Number of straight rings before tilting can start
    generationDistance: 450, // How far ahead to generate rings
    cleanupDistance: 200, // How far behind to clean up rings
  },

  // Scoring System
  scoring: {
    basePoints: 10,
    perfectZonePercentage: 0.3, // 30% of ring radius for perfect zone
    multipliers: {
      streak2: 2,
      streak3: 3,
      streak4: 4,
      streak5: 5, // Maximum multiplier
    },
    streakThresholds: {
      multiplier2: 2,
      multiplier3: 3,
      multiplier4: 4,
      multiplier5: 5,
    },
  },

  // Visual Effects & Colors
  colors: {
    basketball: 0xff8c42,
    defaultRing: 0xff69b4, // Hot pink
    streakColors: {
      streak2: 0x3a86ff,  // Blue
      streak3: 0x9d4edd,  // Purple
      streak4: 0xff6b35,  // Orange
      streak5: 0xffd700,  // Gold
    },
    ui: {
      scoreText: 0xffffff,
      streakText: 0xffd700,
      multiplierText: 0x00ff00,
      gameOverBackground: 0x000000,
      gameOverText: 0xffffff,
    },
  },

  // Game Boundaries
  boundaries: {
    top: 350, // Lowered from 50 to give more reasonable top boundary
    bottom: 1600, // Set to canvas.height (bottom of screen)
    left: 0,
    right: 1000, // canvas.width
  },

  // Collision Detection
  collision: {
    ringRangeBuffer: 50, // Extra distance for collision detection
    rimCollisionTolerance: 5,
    edgeDetectionBuffer: 10,
    // Elastic collision physics constants
    coefficientOfRestitution: 0.8, // Energy retention on bounce (0-1)
    impactAngleInfluence: 0.8, // How much impact angle affects bounce direction
    rimEdgeStiffness: 0.9, // How "hard" the rim edges are (affects bounce)
    spinTransferFactor: 0.4, // How much collision affects ball spin
    centerThreshold: 0.6, // Distance threshold for "close to center" bounces (as fraction of ring radius)
  },

  // Camera System
  camera: {
    followSmoothing: 0.1,
    horizontalOffset: 300, // Keep basketball this far from left edge
  },

  // Power-ups (Future Implementation)
  powerUps: {
    shield: {
      duration: 15000, // 15 seconds in milliseconds
      color: 0x00ffff,
    },
    bonusRingChance: 0.05, // 5% chance for bonus rings
  },

  // UI Settings
  ui: {
    fontSize: {
      score: 48,
      streak: 32,
      multiplier: 24,
      gameOver: 64,
      instructions: 20,
    },
    padding: {
      top: 50,
      left: 50,
      right: 50,
      bottom: 50,
    },
    positions: {
      scoreY: 100,
      streakY: 150,
      multiplierY: 200,
    },
  },

  // Audio Settings (Future Implementation)
  audio: {
    volume: {
      master: 0.7,
      sfx: 0.8,
      music: 0.5,
    },
  },

  // Difficulty Scaling (Future Implementation)
  difficulty: {
    baseRingSpacing: 800,
    minRingSpacing: 500,
    spacingReductionRate: 0.95, // Multiply by this every X rings
    spacingReductionInterval: 10, // Every 10 rings
  },

  // Performance Settings
  performance: {
    maxRings: 10, // Maximum rings to keep in memory
    objectPoolSize: 20, // For future object pooling
  },

  // Debug Settings
  debug: {
    enabled: true,
    showBoundaries: false,
    showCollisionBoxes: false,
    showPerfectZones: false,
    logCollisions: false,
  },
} as const

// Type definitions for better TypeScript support
export type GameConstantsType = typeof GameConstants

// Export individual sections for convenience
export const PhysicsConstants = GameConstants.physics
export const BasketballConstants = GameConstants.basketball
export const RingConstants = GameConstants.rings
export const ScoringConstants = GameConstants.scoring
export const ColorConstants = GameConstants.colors
export const UIConstants = GameConstants.ui
export const CameraConstants = GameConstants.camera
export const BoundaryConstants = GameConstants.boundaries
export const CollisionConstants = GameConstants.collision

export default GameConstants