export class Flight {
  constructor(options) {
    this.name = options.name;
    this.position = options.position;
    this.velocity = options.velocity
      ? options.velocity
      : {
          x: 0,
          y: 0,
        };

    this.image = options.image;
    this.hp = options.maxHp;
    this.maxHp = options.maxHp;

    this.width = options.width;
    this.height = (options.width / this.image.width) * this.image.height;
    this.shootCoolDown = 0;
  }

  draw(c) {
    const hpRemaining = this.hp / this.maxHp;

    c.fillStyle = "red";
    c.fillRect(this.position.x, this.position.y - 20, this.width, 5);

    if (hpRemaining > 0) {
      c.fillStyle = "green";
      c.fillRect(
        this.position.x,
        this.position.y - 20,
        this.width * hpRemaining,
        5
      );
    }

    c.drawImage(
      this.image,
      this.position.x,
      this.position.y,
      this.width,
      this.height
    );
  }

  update(canvas) {
    this.position.y = this.position.y + this.velocity.y;
    this.position.x = this.position.x + this.velocity.x;
    this.draw(canvas.getContext("2d"));
  }
}

export class Projectile {
  constructor(options) {
    this.width = options.width;
    this.height = options.height;
    this.position = options.position;
    this.velocity = options.velocity;
    this.color = options.color;
    this.ap = options.ap;
  }

  draw(c) {
    c.fillStyle = this.color;

    const radius = this.width / 3;

    const xPos =
      this.velocity.x > 0
        ? this.position.x + this.width + radius / 2
        : this.position.x - radius / 2;

    c.globalAlpha = 0.75;
    c.beginPath();
    c.arc(xPos, this.position.y + this.height / 2, radius, 0, 2 * Math.PI);

    c.fill();
    c.globalAlpha = 1;
    c.fillRect(this.position.x, this.position.y, this.width, this.height);
  }

  update(canvas) {
    this.position.x = this.position.x + this.velocity.x;
    this.draw(canvas.getContext("2d"));
  }
}
