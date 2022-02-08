import { Game } from "./game";
import "./style.css";
import playerImg from "./images/plane.png";
import enemyImg from "./images/plane_enemy.png";
import enemyBroken from "./images/plane_enemy_broken.png";
import { Flight } from "./flight";

const canvas = document.querySelector("canvas");
const WIDTH = 1024;
const HEIGHT = 768;
canvas.width = WIDTH * window.devicePixelRatio;
canvas.height = HEIGHT * window.devicePixelRatio;
canvas.style.width = WIDTH + "px";
canvas.style.height = HEIGHT + "px";

function loadImg(imgSrc) {
  const image = new Image();
  image.src = imgSrc;

  return new Promise((resolve) => {
    image.onload = () => {
      resolve(image);
    };
  });
}

function loadAssets() {
  return Promise.all([
    loadImg(playerImg),
    loadImg(enemyImg),
    loadImg(enemyBroken),
  ]);
}

let loading = false;

function startGame() {
  if (loading) return;
  loading = true;
  document.querySelector(".start").textContent = "Loading...";
  loadAssets().then((images) => {
    loading = false;
    canvas.classList.remove("hide");
    const gameSummary = document.querySelector("#game-summary");
    document.querySelector(".controls").classList.add("hide");
    gameSummary.classList.add("hide");
    const [playerImg, enemyImg, enemyBrokenImg] = images;

    const player = new Flight({
      name: "Player 1",
      width: 120,
      position: {
        x: 80,
        y: 600,
      },
      image: playerImg,
      maxHp: 100,
    });

    const game = new Game({
      canvas,
      enemyImg,
      enemyBrokenImg,
      onGameOver: (score) => {
        const scoreDisplay = document.querySelector("#score");

        scoreDisplay.textContent = score;
        gameSummary.classList.remove("hide");
      },
    });

    game.setPlayer(player);

    game.gameLoop();

    window.game = game;
  });
}

document
  .querySelectorAll(".start")
  .forEach((button) => button.addEventListener("click", startGame));
