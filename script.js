/** @type {HTMLCanvasElement} */
const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d');
const CANVAS_WIDTH = (canvas.width = window.innerWidth);
const CANVAS_HEIGHT = (canvas.height = window.innerHeight);
let ravens = [];

class Raven {
	constructor() {
		this.image = new Image();
		this.image.src = './assets/raven.png';
		this.spriteWidth = 271;
		this.spriteHeight = 194;
		this.width = this.spriteWidth * 0.7;
		this.height = this.spriteHeight * 0.7;
		this.x = Math.random() * CANVAS_WIDTH + CANVAS_WIDTH;
		this.y = Math.random() * (CANVAS_HEIGHT - this.height);
		this.directionX = Math.random() * 5 + 5;
		this.directionY = Math.random() * 5 - 2.5;
		this.frame = 0;
		this.staggerFrames = 0;
		this.animationSpeed = Math.floor(Math.random() * 5 + 1) + 5;
	}
	update() {
		this.x -= this.directionX;
		this.y += this.directionY;
		this.staggerFrames++;
		if (this.staggerFrames % this.animationSpeed === 0) {
			if (this.frame < 5) {
				this.frame++;
			} else this.frame = 0;
		}
	}
	draw() {
		ctx.drawImage(
			this.image,
			this.frame * this.spriteWidth,
			0,
			this.spriteWidth,
			this.spriteHeight,
			this.x,
			this.y,
			this.width,
			this.height
		);
	}
}

function spawn() {
	for (let i = 0; i < 10; i++) {
		ravens.push(new Raven());
	}
}
function animate() {
	ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

	for (let i in ravens) {
		ravens[i].draw();
		ravens[i].update();
	}

	requestAnimationFrame(animate);
}

animate();

canvas.addEventListener('click', () => {
	spawn();
});
