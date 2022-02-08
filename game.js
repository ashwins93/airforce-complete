import { throttle, times } from "lodash";
import { Flight, Projectile } from "./flight";

export class Game {
  constructor({ canvas, enemyImg, enemyBrokenImg, onGameOver }) {
    this.canvas = canvas;

    this.objects = {
      player: null,
      enemies: [],
      playerProjectiles: [],
      enemyProjectiles: [],
      particles: [],
    };

    this.keyPressed = {};

    this.enemySpawnInterval = 2000;
    this.enemyShootIntervalMin = 50;
    this.enemyShootIntervalMax = 200;
    this.maxEnemies = 5;
    this.gameOver = false;
    this.enemyBrokenImg = enemyBrokenImg;

    window.addEventListener("keydown", this.onKeyDown.bind(this));
    window.addEventListener("keyup", this.onKeyUp.bind(this));

    this.enemySpawnIntervalId = setInterval(() => {
      if (this.objects.enemies.length < this.maxEnemies) {
        this.spawnEnemy(enemyImg);
      }
    }, this.enemySpawnInterval);

    this.score = 0;

    this.onGameOver = onGameOver;
  }

  setPlayer(player) {
    this.objects.player = player;
  }

  paint() {
    const c = this.canvas.getContext("2d");

    // clear frame
    c.fillStyle = "#81D4FA";
    c.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // draw score
    c.font = "30px 'Press Start 2P'";
    c.fillStyle = "#FFF";
    c.fillText(`Score: ${this.score}`, 10, 50);

    this.objects.player.update(this.canvas);

    let indexesToRemove = [];

    this.objects.playerProjectiles.forEach((projectile, idx) => {
      if (projectile.position.x > this.canvas.width) {
        indexesToRemove.push(idx);
      }

      this.objects.enemies.forEach((enemy) => {
        if (Game.hasCollided(projectile, enemy)) {
          enemy.hp -= projectile.ap;
          indexesToRemove.push(idx);
        }
      });

      projectile.update(this.canvas);
    });

    indexesToRemove.forEach((idx) => {
      this.objects.playerProjectiles.splice(idx, 1);
    });

    indexesToRemove = [];

    this.objects.enemyProjectiles.forEach((projectile, idx) => {
      if (projectile.position.x < 0) {
        indexesToRemove.push(idx);
      }

      if (Game.hasCollided(projectile, this.objects.player)) {
        this.objects.player.hp -= projectile.ap;
        indexesToRemove.push(idx);
      }

      projectile.update(this.canvas);
    });

    indexesToRemove.forEach((idx) => {
      this.objects.enemyProjectiles.splice(idx, 1);
    });

    indexesToRemove = [];

    this.objects.enemies.forEach((enemy, idx) => {
      if (
        enemy.position.x + enemy.width < 0 ||
        enemy.position.y > this.canvas.height
      ) {
        indexesToRemove.push(idx);
      }

      if (enemy.hp <= 0) {
        enemy.image = this.enemyBrokenImg;
        enemy.velocity.y = 10;

        if (!enemy.scored) {
          this.score++;
          enemy.scored = true;
        }
      } else if (enemy.shootCoolDown === 0) {
        this.objects.enemyProjectiles.push(
          new Projectile({
            width: 15,
            height: 2,
            color: "#ff23ff",
            position: {
              x: enemy.position.x,
              y: enemy.position.y + enemy.height / 2,
            },
            velocity: {
              x: -10,
              y: 0,
            },
            ap: 5,
          })
        );
        enemy.shootCoolDown =
          this.enemyShootIntervalMin +
          Math.floor(
            Math.random() *
              (this.enemyShootIntervalMax - this.enemyShootIntervalMin)
          );
      } else {
        enemy.shootCoolDown--;
      }

      enemy.update(this.canvas);
    });

    indexesToRemove.forEach((idx) => {
      this.objects.enemies.splice(idx, 1);
    });
  }

  gameLoop() {
    if (!this.objects.player) return;
    this.paint();

    const player = this.objects.player;

    if (
      this.keyPressed.arrowdown &&
      player.position.y + player.height < this.canvas.height - 20
    ) {
      this.objects.player.velocity.y = 15;
    } else if (this.keyPressed.arrowup && player.position.y > 20) {
      this.objects.player.velocity.y = -15;
    } else {
      this.objects.player.velocity.y = 0;
    }

    if (this.objects.player.hp <= 0) {
      this.gameOver = true;
      clearInterval(this.enemySpawnIntervalId);
      this.onGameOver(this.score);
    }

    if (!this.gameOver) {
      requestAnimationFrame(this.gameLoop.bind(this));
    }
  }

  onKeyDown(event) {
    // console.log(event.key.toLowerCase(), "pressed");
    this.keyPressed[event.key.toLowerCase()] = true;

    if (event.key.toLowerCase() === "z") {
      const player = this.objects.player;
      this.objects.playerProjectiles.push(
        new Projectile({
          width: 15,
          height: 2,
          color: "#FF5722",
          position: {
            x: player.position.x + player.width,
            y: player.position.y + player.height / 2,
          },
          velocity: {
            x: 10,
            y: 0,
          },
          ap: 10,
        })
      );
    }
  }

  onKeyUp(event) {
    this.keyPressed[event.key.toLowerCase()] = false;
  }

  spawnEnemy(enemyImg) {
    const enemyYPosition = Math.random() * (this.canvas.height - 100) + 50;
    const newEnemy = new Flight({
      name: "enemy",
      position: {
        x: this.canvas.width,
        y: enemyYPosition,
      },
      velocity: {
        x: -3,
        y: 0,
      },
      image: enemyImg,
      width: 120,
      maxHp: 30,
    });

    this.objects.enemies.push(newEnemy);
  }

  static hasCollided(object1, object2) {
    return (
      object1.position.x < object2.position.x + object2.width &&
      object1.position.x + object1.width > object2.position.x &&
      object1.position.y < object2.position.y + object2.height &&
      object1.position.y + object1.height > object2.position.y
    );
  }
}
