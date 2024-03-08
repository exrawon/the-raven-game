/** @type {HTMLCanvasElement} */
const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d');
const collisionCanvas = document.getElementById('collisionCanvas');
const collisionCtx = collisionCanvas.getContext('2d');
const CANVAS_WIDTH = (canvas.width = window.innerWidth);
const CANVAS_HEIGHT = (canvas.height = window.innerHeight);
collisionCanvas.width = window.innerWidth;
collisionCanvas.height = window.innerHeight;

let timeToNextRaven = 0;
let ravenInterval = 1000;
let lastTime = 0;
let score = 0;
let gameOver = false;
ctx.font = ' 4vmin Impact';

let ravens = [];

class Raven {
	constructor() {
		this.image = new Image();
		this.image.src = './assets/raven.png';
		this.spriteWidth = 271;
		this.spriteHeight = 194;
		this.sizeModifier = Math.random() * 0.6 + 0.4;
		this.width = this.spriteWidth * this.sizeModifier;
		this.height = this.spriteHeight * this.sizeModifier;
		this.x = Math.random() * CANVAS_WIDTH + CANVAS_WIDTH;
		this.y = Math.random() * (CANVAS_HEIGHT - this.height);
		this.directionX = Math.random() * 25 + 3;
		this.directionY = Math.random() * 5 - 2.5;
		this.toDelete = false;
		this.frame = 0;
		this.maxFrame = 5;
		this.timeSinceFlap = 0;
		this.flapInterval = Math.random() * 50 + 50;
		this.randomColor = [
			Math.floor(Math.random() * 256),
			Math.floor(Math.random() * 256),
			Math.floor(Math.random() * 256),
		];
		this.hitboxColor = `rgb(${this.randomColor[0]},${this.randomColor[1]},${this.randomColor[2]})`;
	}
	update(deltaTime) {
		this.x -= this.directionX;
		this.y += this.directionY;

		if (this.y < 0 || this.y > CANVAS_HEIGHT - this.height) {
			this.directionY *= -1;
		}

		if (this.x < 0 - this.width) {
			this.toDelete = true;
		}
		this.timeSinceFlap += deltaTime;
		if (this.timeSinceFlap > this.flapInterval) {
			if (this.frame < this.maxFrame) {
				this.frame++;
			} else this.frame = 0;
			this.timeSinceFlap = 0;
		}
		if (this.x < 0 - this.width) {
			gameOver = true;
		}
	}
	draw() {
		collisionCtx.fillStyle = this.hitboxColor;
		collisionCtx.fillRect(this.x, this.y, this.width, this.height);
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

let explosions = [];
class Explosion {
	constructor(x, y, size) {
		this.image = new Image();
		this.image.src = './assets/boom.png';
		this.spriteWidth = 200;
		this.spriteHeight = 179;
		this.size = size;
		this.x = x;
		this.y = y;
		this.frame = 0;
		this.maxFrame = 5;
		this.sound = new Audio('./assets/pistol.wav');
		this.staggerFrame = 0;
		this.frameInterval = 100;
		this.toDelete = false;
	}
	update(deltaTime) {
		if (this.frame === 0) {
			this.sound.play();
		}
		this.staggerFrame += deltaTime;
		if (this.staggerFrame > this.frameInterval) {
			this.frame++;
			this.staggerFrame = 0;
			if (this.frame > this.maxFrame) {
				this.toDelete = true;
			}
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
			this.y - this.size / 4,
			this.size,
			this.size * (this.spriteHeight / this.spriteWidth)
		);
	}
}

function drawScore() {
	ctx.fillStyle = 'grey';
	ctx.fillText(`🐦 ${score}`, 50, 75);
	ctx.fillStyle = 'black';
	ctx.fillText(`🐦 ${score}`, 48, 73);
}

function drawGameOver() {
	ctx.font = '100px Impact';
	ctx.textAlign = 'center';
	ctx.fillStyle = 'grey';
	ctx.fillText(`GAME OVER`, canvas.width / 2, canvas.height / 2);
	ctx.fillStyle = 'black';
	ctx.fillText(`GAME OVER`, canvas.width / 2 - 2, canvas.height / 2 - 2);
}
window.addEventListener('click', (e) => {
	const detectPixelColor = collisionCtx.getImageData(e.x, e.y, 1, 1);
	//getImageData returns array of srbg values of the clicked image
	const pixelColor = [...detectPixelColor.data].splice(0, 3).join('');
	//turning the srbg into an identifier key for individual ravens
	ravens.map((obj) => {
		if (obj.randomColor.join('') === pixelColor) {
			//collision detected
			obj.toDelete = true;
			score++;
			explosions.push(new Explosion(obj.x, obj.y, obj.width));
		}
	});
});

function spawn() {
	for (let i = 0; i < 1; i++) {
		ravens.push(new Raven());
	}
}
function animate(timestamp) {
	ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
	collisionCtx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
	let deltaTime = timestamp - lastTime;
	lastTime = timestamp;

	timeToNextRaven += deltaTime;
	if (timeToNextRaven >= ravenInterval) {
		spawn();
		timeToNextRaven = 0;
		ravens.sort((a, b) => {
			return a.width - b.width;
		});
	}
	drawScore();
	//using spread operator
	[...ravens, ...explosions].forEach((obj) => {
		obj.update(deltaTime);
		obj.draw();
	});

	// to remove ravens & explosions which are out of screen from the ravens array
	ravens = ravens.filter((obj) => {
		return !obj.toDelete;
	});
	explosions = explosions.filter((obj) => {
		return !obj.toDelete;
	});

	if (!gameOver) {
		requestAnimationFrame(animate);
	} else drawGameOver();
}

animate(0);
