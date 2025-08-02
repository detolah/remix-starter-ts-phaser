import GameSettings from "../config/GameSettings"

interface Ball {
  sprite: Phaser.GameObjects.Arc
  velocityX: number
  velocityY: number
  radius: number
}

export class GameScene extends Phaser.Scene {
  private balls: Ball[] = []

  constructor() {
    super({ key: "GameScene" })
  }

  preload(): void {}

  create(): void {
    // Add instructional text
    const title = this.add.text(GameSettings.canvas.width / 2, GameSettings.canvas.height / 2 - 100, 'Remix Server Test', {
      fontSize: '64px',
      color: '#ffffff',
      fontFamily: 'Arial'
    }).setOrigin(0.5).setDepth(100)

    const instruction = this.add.text(GameSettings.canvas.width / 2, GameSettings.canvas.height / 2 - 20, 'These bouncing balls test that your dev server is working.\nAsk your LLM to remove them when ready to build your game.', {
      fontSize: '32px',
      color: '#cccccc',
      fontFamily: 'Arial',
      align: 'center'
    }).setOrigin(0.5).setDepth(100)

    // Create bouncing balls
    this.createBalls(15)
  }

  private createBalls(count: number): void {
    for (let i = 0; i < count; i++) {
      const radius = Phaser.Math.Between(15, 40)
      const x = Phaser.Math.Between(radius, GameSettings.canvas.width - radius)
      const y = Phaser.Math.Between(radius, GameSettings.canvas.height - radius)
      
      const ball = this.add.circle(x, y, radius, Phaser.Math.Between(0x000000, 0xffffff))
      ball.setStrokeStyle(2, 0xffffff)
      
      const ballData: Ball = {
        sprite: ball,
        velocityX: Phaser.Math.Between(-300, 300),
        velocityY: Phaser.Math.Between(-300, 300),
        radius: radius
      }
      
      this.balls.push(ballData)
    }
  }

  update(_time: number, deltaTime: number): void {
    const dt = deltaTime / 1000

    this.balls.forEach(ball => {
      // Update position
      ball.sprite.x += ball.velocityX * dt
      ball.sprite.y += ball.velocityY * dt

      // Bounce off edges
      if (ball.sprite.x - ball.radius <= 0 || ball.sprite.x + ball.radius >= GameSettings.canvas.width) {
        ball.velocityX *= -1
        ball.sprite.x = Phaser.Math.Clamp(ball.sprite.x, ball.radius, GameSettings.canvas.width - ball.radius)
      }
      
      if (ball.sprite.y - ball.radius <= 0 || ball.sprite.y + ball.radius >= GameSettings.canvas.height) {
        ball.velocityY *= -1
        ball.sprite.y = Phaser.Math.Clamp(ball.sprite.y, ball.radius, GameSettings.canvas.height - ball.radius)
      }
    })
  }

  // --- Scene Shutdown Logic ---
  shutdown() {}
}
