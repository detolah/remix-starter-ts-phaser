/**
 * Game Settings for GAME_NAME
 * Legacy file - use GameConstants.ts for all game configuration
 * This file is kept for backwards compatibility
 */

import GameConstants from './GameConstants'

export const GameSettings = {
  debug: GameConstants.debug.enabled,
  canvas: GameConstants.canvas,
}

export default GameSettings
