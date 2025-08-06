# CORELOOP.md

## Core Gameplay Loop Implementation Plan

Based on the GAMEPLAN.md and current GameScene.ts analysis, this document outlines the implementation plan for the core basketball jumping game loop.

## Current State Analysis

The existing GameScene.ts already implements a basic version of our target game:
- ✅ Basketball object with gravity physics
- ✅ Tap-to-jump controls
- ✅ Ring collision detection
- ✅ Basic scoring system (10 points per ring)
- ✅ Game over conditions (boundaries + ring collision)
- ✅ Static ring positioning

## Core Loop Architecture

### 1. Game State Flow
```
Game Start → Ball Physics Update → Input Handling → Collision Detection → Scoring → Ring Management → Game Over Check → Loop
```

### 2. Key Systems to Enhance

#### A. Physics System (Current: Basic, Target: Enhanced)
- **Current**: Simple gravity + velocity
- **Enhance**: Add realistic rolling physics when ball hits ring edges
- **Implementation**: Detect edge contact and apply angular momentum

#### B. Scoring System (Current: Basic, Target: Streak Multipliers)
- **Current**: Flat 10 points per ring
- **Add**: Perfect entrance detection (no edge contact)
- **Add**: Streak multiplier system (2x, 3x, 4x, 5x)
- **Add**: Visual feedback for streaks

#### C. Ring Management (Current: Static, Target: Dynamic)
- **Current**: Fixed 5 rings, random positioning
- **Enhance**: Infinite ring generation
- **Add**: Progressive difficulty scaling
- **Add**: Ring recycling system

#### D. Visual Effects (Current: Minimal, Target: Polished)
- **Add**: Ring color changes during streaks (golden rings)
- **Add**: Particle effects for successful entries
- **Add**: Character visual effects during power-ups

## Implementation Phases

### Phase 1: Enhanced Physics & Rolling Mechanics
**Priority**: HIGH
**Files to modify**: `GameScene.ts`

1. **Add Angular Velocity to Basketball**
   ```typescript
   interface Basketball {
     sprite: Phaser.GameObjects.Arc
     velocityY: number
     angularVelocity: number // NEW
     radius: number
   }
   ```

2. **Implement Edge Detection**
   - Detect left vs right edge contact on rings
   - Left edge: Apply inward rolling physics
   - Right edge: Apply outward rolling physics

3. **Rolling Physics**
   - Convert contact momentum to angular velocity
   - Allow ball to "roll" into ring opening
   - Maintain realistic physics behavior

### Phase 2: Advanced Scoring System
**Priority**: HIGH
**Files to modify**: `GameScene.ts`

1. **Perfect Entrance Detection**
   - Track if ball passes through ring without touching edges
   - Distinguish between perfect and regular entrances

2. **Streak System**
   ```typescript
   interface ScoreSystem {
     score: number
     perfectStreak: number
     currentMultiplier: number // 1x, 2x, 3x, 4x, 5x
   }
   ```

3. **Multiplier Logic**
   - 2+ perfect: 2x multiplier
   - 3+ perfect: 3x multiplier
   - 4+ perfect: 4x multiplier
   - 5+ perfect: 5x multiplier (cap)
   - Any non-perfect entrance resets streak

### Phase 3: Infinite Ring Generation
**Priority**: MEDIUM
**Files to modify**: `GameScene.ts`

1. **Ring Pool System**
   - Create ring object pool for performance
   - Recycle rings as they move off-screen

2. **Dynamic Ring Positioning**
   - Generate rings ahead of ball position
   - Implement difficulty scaling algorithm
   - Maintain strategic positioning (not just random)

3. **Camera/World Management**
   - Implement camera following
   - World bounds management for infinite scrolling

### Phase 4: Visual Polish & Effects
**Priority**: MEDIUM
**Files to modify**: `GameScene.ts`

1. **Ring Visual States**
   - Default ring appearance
   - Golden rings during perfect streaks
   - Streak-specific colors (2x, 3x, 4x, 5x)

2. **Particle Effects**
   - Success particles when entering rings
   - Trail effects during perfect streaks
   - Impact effects on edge contact

3. **UI Enhancements**
   - Streak counter display
   - Multiplier indicator
   - Perfect entrance feedback

### Phase 5: Power-up System (Future)
**Priority**: LOW
**Files to create**: `systems/PowerUpSystem.ts`

1. **Shield Power-up**
   - 15-second duration
   - Prevents game over conditions
   - Visual indication when active

2. **Bonus Rings**
   - Special rings containing power-ups
   - Different visual appearance
   - Rare spawn rate

## Technical Implementation Details

### Core Game Loop Structure
```typescript
update(time: number, deltaTime: number): void {
  if (this.gameOver) return
  
  // 1. Physics Update
  this.updateBasketballPhysics(deltaTime)
  
  // 2. Ring Management
  this.updateRings(deltaTime)
  this.generateNewRings()
  
  // 3. Collision Detection
  this.checkRingCollisions()
  this.checkBoundaries()
  
  // 4. Scoring & Effects
  this.updateScore()
  this.updateVisualEffects()
  
  // 5. Game State
  this.checkGameOverConditions()
}
```

### Key Collision Detection Algorithm
```typescript
private checkRingEntrance(ball: Basketball, ring: Ring): EntranceResult {
  const distance = Phaser.Math.Distance.Between(ball.sprite.x, ball.sprite.y, ring.x, ring.y)
  
  // Perfect entrance (no edge contact)
  if (distance <= ring.innerRadius - ball.radius) {
    return { type: 'perfect', points: this.calculatePoints(true) }
  }
  
  // Edge contact entrance
  if (this.ballPassedThroughRing(ball, ring)) {
    return { type: 'regular', points: 10 }
  }
  
  // Collision with ring structure
  if (distance <= ring.outerRadius + ball.radius && distance >= ring.innerRadius - ball.radius) {
    return { type: 'collision', points: 0 }
  }
  
  return { type: 'none', points: 0 }
}
```

## File Structure Changes

### New Files to Create
- `systems/PhysicsSystem.ts` - Enhanced physics calculations
- `systems/ScoringSystem.ts` - Streak and multiplier logic
- `systems/RingManager.ts` - Infinite ring generation
- `systems/EffectsSystem.ts` - Visual effects management

### Modified Files
- `GameScene.ts` - Main integration of all systems
- `types.ts` - New interfaces for enhanced game objects

## Success Metrics

### Phase 1 Complete When:
- Ball can roll into rings from edge contact
- Realistic physics feel achieved
- Edge detection working correctly

### Phase 2 Complete When:
- Perfect vs regular entrances detected
- Streak system functioning
- Multiplier scoring working
- Visual feedback for streaks

### Phase 3 Complete When:
- Infinite ring generation working
- Performance optimized with object pooling
- Difficulty scaling implemented

### Phase 4 Complete When:
- Ring color changes with streaks
- Particle effects implemented
- Polished visual feedback

## Implementation Checklist

### Phase 1: Enhanced Physics & Rolling Mechanics (HIGH PRIORITY)
- [ ] Add angular velocity to Basketball interface
- [ ] Implement edge detection for ring collisions
- [ ] Add rolling physics when ball hits ring edges
- [ ] Test and tune rolling mechanics feel

### Phase 2: Advanced Scoring System (HIGH PRIORITY)
- [ ] Add perfect entrance detection logic
- [ ] Implement streak counting system
- [ ] Add multiplier scoring (2x, 3x, 4x, 5x)
- [ ] Add streak visual feedback to UI

### Phase 3: Infinite Ring Generation (MEDIUM PRIORITY)
- [ ] Implement ring object pooling system
- [ ] Add infinite ring generation
- [ ] Implement difficulty scaling algorithm

### Phase 4: Visual Polish & Effects (MEDIUM PRIORITY)
- [ ] Add ring color changes for streaks
- [ ] Implement particle effects for ring entries
- [ ] Add visual effects for perfect streaks

### Phase 5: Power-up System (LOW PRIORITY)
- [ ] Implement shield power-up (15-second duration)
- [ ] Add bonus rings containing power-ups
- [ ] Create power-up visual indicators

## Next Steps

1. **Start with Phase 1**: Implement enhanced physics and rolling mechanics
2. **Test thoroughly**: Ensure physics feel natural and fun
3. **Iterate on difficulty**: Fine-tune jump force, gravity, and ring positioning
4. **Add Phase 2**: Implement scoring system with streaks
5. **Polish and test**: Ensure core loop is engaging before adding complexity

This core loop will provide the foundation for an engaging endless arcade game that matches the vision outlined in GAMEPLAN.md.