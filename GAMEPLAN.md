# GAMEPLAN.md

## Game Overview
**Genre**: Endless Arcade / One-tap Flappy Bird-style  
**Platform**: Remix/Farcade (Mobile-first, 5:9 aspect ratio)  
**Core Mechanic**: Tap to jump basketball through rings with gravity physics

## Game Concept
A basketball continuously falls due to gravity. Player taps to make it jump upward. The goal is to pass through circular rings positioned at various heights. The game continues infinitely until the player fails.

## Character & Physics
- **Character**: Basketball-shaped ball
- **Movement**: 
  - Gravity constantly pulls character downward
  - Tap to jump as high as possible
  - Must avoid touching top boundary (game over)
  - Must avoid touching bottom ground (game over)
- **Physics**: Realistic rolling when hitting ring edges
  - Left edge contact: rolls into ring
  - Right edge contact: rolls forward (prevents ring entry)

## Ring System
- **Appearance**: Circular rings with openings
- **Positioning**: 
  - Stationary rings
  - Randomly positioned (middle, near top, near bottom)
  - Strategic difficulty positioning as game progresses
  - Opening size allows character to pass through
  - Can be "bent" for added difficulty
- **Behavior**: Character can land on edge and roll into hole

## Scoring System
- **Base Score**: 10 points per ring entrance
- **Perfect Streak Multipliers**:
  - 2x points (2 consecutive perfect entrances)
  - 3x points (3 consecutive perfect entrances)  
  - 4x points (4 consecutive perfect entrances)
  - 5x points (5+ consecutive perfect entrances, maintains at 5x)
- **Perfect Entrance**: Passing through ring without touching sides
- **Regular Entrance**: Any ring entry (including rolling in from edge) = 10 points, breaks perfect streak

## Visual Effects & Feedback
- **Ring Colors**:
  - Default: Standard color
  - Golden: During active perfect streak
  - Streak-specific colors for 2x, 3x, 4x, 5x multipliers
- **Special Effects**: Visual effects during streaks and power-ups
- **Character Effects**: Only visible during power-ups and active streaks

## Power-up System
- **Shield Power-up**: 
  - Duration: 15 seconds
  - Effect: Prevents game over when touching edges or missing rings
  - Location: Inside bonus rings
- **Future Power-ups**: Placeholder for additional power-ups

## Difficulty Progression
- **Ring Positioning**: Becomes more strategically difficult over time
- **Pattern Complexity**: More complex ring arrangements as game progresses
- **Maintains**: Constant ring size, character size, basic physics

## Game Over Conditions
1. Character touches top boundary
2. Character touches bottom ground  
3. Character fails to enter a ring (unless shield is active)

## Visual Theme
- **Style**: Forest theme OR abstract background
- **Focus**: Clean visuals that don't distract from gameplay
- **Game Over**: Game over screen with restart option

## Audio Design (Future Implementation)
- **Sound Effects**: 
  - Ball bouncing/rolling sounds
  - Whoosh effects for jumping
  - Success chimes for ring entries
  - Streak notification sounds
- **Background Music**: Ambient/arcade style music

## Technical Requirements
- **Platform**: Phaser.js + TypeScript
- **Aspect Ratio**: 5:9 (1000x1800) mobile-first
- **Physics**: Arcade physics for gravity and collision
- **Input**: Touch/tap controls
- **Deployment**: Single HTML file for Remix platform

## Development Phases
1. **Core Mechanics**: Ball physics, tap controls, ring collision
2. **Scoring System**: Points, streak detection, multipliers
3. **Visual Polish**: Ring effects, streak colors, UI
4. **Power-up System**: Shield implementation, bonus rings
5. **Difficulty Scaling**: Progressive ring positioning
6. **Audio Integration**: Sound effects and music
7. **Polish & Testing**: Performance optimization, mobile testing