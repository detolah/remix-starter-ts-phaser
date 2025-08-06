import { ScoreData } from '../types/GameTypes'
import { ScoringConstants, ColorConstants } from '../config/GameConstants'

export class ScoringSystem {
  private data: ScoreData

  constructor() {
    this.data = {
      score: 0,
      perfectStreak: 0,
      currentMultiplier: 1
    }
  }

  addPerfectScore(): number {
    this.data.perfectStreak++
    this.updateMultiplier()
    const points = ScoringConstants.basePoints * this.data.currentMultiplier
    this.data.score += points
    return points
  }

  addRegularScore(): number {
    this.data.perfectStreak = 0
    this.data.currentMultiplier = 1
    const points = ScoringConstants.basePoints
    this.data.score += points
    return points
  }

  private updateMultiplier(): void {
    if (this.data.perfectStreak >= ScoringConstants.streakThresholds.multiplier5) {
      this.data.currentMultiplier = ScoringConstants.multipliers.streak5
    } else if (this.data.perfectStreak >= ScoringConstants.streakThresholds.multiplier4) {
      this.data.currentMultiplier = ScoringConstants.multipliers.streak4
    } else if (this.data.perfectStreak >= ScoringConstants.streakThresholds.multiplier3) {
      this.data.currentMultiplier = ScoringConstants.multipliers.streak3
    } else if (this.data.perfectStreak >= ScoringConstants.streakThresholds.multiplier2) {
      this.data.currentMultiplier = ScoringConstants.multipliers.streak2
    } else {
      this.data.currentMultiplier = 1
    }
  }

  getRingColor(): number {
    if (this.data.perfectStreak >= ScoringConstants.streakThresholds.multiplier5) return ColorConstants.streakColors.streak5
    if (this.data.perfectStreak >= ScoringConstants.streakThresholds.multiplier4) return ColorConstants.streakColors.streak4
    if (this.data.perfectStreak >= ScoringConstants.streakThresholds.multiplier3) return ColorConstants.streakColors.streak3
    if (this.data.perfectStreak >= ScoringConstants.streakThresholds.multiplier2) return ColorConstants.streakColors.streak2
    return ColorConstants.defaultRing
  }

  get score(): number {
    return this.data.score
  }

  get perfectStreak(): number {
    return this.data.perfectStreak
  }

  get currentMultiplier(): number {
    return this.data.currentMultiplier
  }

  getData(): ScoreData {
    return { ...this.data }
  }

  reset(): void {
    this.data = {
      score: 0,
      perfectStreak: 0,
      currentMultiplier: 1
    }
  }
}