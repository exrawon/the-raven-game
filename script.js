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
ctx.font = ' 2vw Impact';

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
		this.directionX = Math.random() * 5 + 3;
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
		// this.staggerFrames = 0;
		// this.animationSpeed = Math.floor(Math.random() * 5 + 1) + 5;
	}
	update(deltaTime) {
		this.x -= this.directionX;
		this.y += this.directionY;

		if (this.y < 0 || this.y > CANVAS_HEIGHT - this.height) {
			this.directionY *= -1;
		}
		// this.staggerFrames++;
		// if (this.staggerFrames % this.animationSpeed === 0) {
		//   if (this.frame < this.maxFrame) {
		//     this.frame++;
		//   } else this.frame = 0;
		// }

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
	}
	draw() {
		ctx.fillStyle = this.hitboxColor;
		ctx.fillRect(this.x, this.y, this.width, this.height);
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

function drawScore() {
	ctx.fillStyle = 'grey';
	ctx.fillText(`Score: ${score}`, 50, 75);
	ctx.fillStyle = 'black';
	ctx.fillText(`Score: ${score}`, 48, 73);
}

window.addEventListener('click', (e) => {
	const detectPixelColor = ctx.getImageData(e.x, e.y, 1, 1);
	console.log(detectPixelColor);
});

function spawn() {
	for (let i = 0; i < 1; i++) {
		ravens.push(new Raven());
	}
}
function animate(timestamp) {
	ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
	let deltaTime = timestamp - lastTime;
	lastTime = timestamp;

	timeToNextRaven += deltaTime;
	if (timeToNextRaven >= ravenInterval) {
		spawn();
		timeToNextRaven = 0;
	}
	drawScore();
	//using spread operator
	[...ravens].forEach((obj) => {
		obj.update(deltaTime);
		obj.draw();
	});

	// to remove ravens which are out of screen from the ravens array
	ravens = ravens.filter((obj) => {
		return !obj.toDelete;
	});

	requestAnimationFrame(animate);
}

animate(0);
