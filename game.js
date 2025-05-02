const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const WIDTH = canvas.width;
const HEIGHT = canvas.height;

class Player {
  constructor(x, y, color, controls) {
    this.x = x;
    this.y = y;
    this.width = 50;
    this.height = 100;
    this.color = color;
    this.speed = 5;
    this.health = 100;
    this.blocking = false;
    this.cooldown = 0;
    this.controls = controls;
  }

  draw() {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }

  move(keysPressed) {
    if (keysPressed[this.controls.left]) this.x -= this.speed;
    if (keysPressed[this.controls.right]) this.x += this.speed;
    if (keysPressed[this.controls.up]) this.y -= this.speed;
    if (keysPressed[this.controls.down]) this.y += this.speed;

    // Boundaries
    this.x = Math.max(0, Math.min(this.x, WIDTH - this.width));
    this.y = Math.max(0, Math.min(this.y, HEIGHT - this.height));
  }

  hit(opponent) {
    if (this.cooldown === 0) {
      const hitbox = {
        x: this.x,
        y: this.y,
        width: this.width,
        height: this.height
      };
      const oppBox = {
        x: opponent.x,
        y: opponent.y,
        width: opponent.width,
        height: opponent.height
      };
      if (isColliding(hitbox, oppBox)) {
        if (!opponent.blocking) {
          opponent.health -= 10;
          opponent.x += (this.x < opponent.x ? 20 : -20);
        }
        this.cooldown = 30;
      }
    }
  }

  update() {
    if (this.cooldown > 0) this.cooldown--;
  }
}

function isColliding(a, b) {
  return a.x < b.x + b.width &&
         a.x + a.width > b.x &&
         a.y < b.y + b.height &&
         a.y + a.height > b.y;
}

// Key tracking
const keysPressed = {};

document.addEventListener('keydown', (e) => keysPressed[e.key] = true);
document.addEventListener('keyup', (e) => keysPressed[e.key] = false);

// Player controls
const player1Controls = {
  left: 'a', right: 'd', up: 'w', down: 's', hit: 'e', block: 'q'
};
const player2Controls = {
  left: 'ArrowLeft', right: 'ArrowRight', up: 'ArrowUp', down: 'ArrowDown', hit: 'm', block: 'n'
};

const player1 = new Player(100, HEIGHT / 2 - 50, 'blue', player1Controls);
const player2 = new Player(650, HEIGHT / 2 - 50, 'red', player2Controls);

function drawHealthBars() {
  ctx.fillStyle = 'black';
  ctx.fillRect(20, 20, 100, 10);
  ctx.fillRect(WIDTH - 120, 20, 100, 10);

  ctx.fillStyle = 'green';
  ctx.fillRect(20, 20, player1.health, 10);
  ctx.fillRect(WIDTH - 120, 20, player2.health, 10);
}

function gameLoop() {
  ctx.clearRect(0, 0, WIDTH, HEIGHT);

  player1.move(keysPressed);
  player2.move(keysPressed);

  player1.blocking = keysPressed[player1Controls.block] || false;
  player2.blocking = keysPressed[player2Controls.block] || false;

  if (keysPressed[player1Controls.hit]) player1.hit(player2);
  if (keysPressed[player2Controls.hit]) player2.hit(player1);

  player1.update();
  player2.update();

  player1.draw();
  player2.draw();
  drawHealthBars();

  if (player1.health <= 0 || player2.health <= 0) {
    ctx.fillStyle = 'black';
    ctx.font = '40px Arial';
    ctx.fillText(player1.health <= 0 ? "Player 2 Wins!" : "Player 1 Wins!", WIDTH / 2 - 140, HEIGHT / 2);
    return;
  }

  requestAnimationFrame(gameLoop);
}

gameLoop();
