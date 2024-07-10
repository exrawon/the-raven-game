window.addEventListener('load', () => {
	/** @type {HTMLCanvasElement} */
	const canvas = document.getElementById('canvas1');
	const ctx = canvas.getContext('2d');
	const collisionCanvas = document.getElementById('collisionCanvas');
	const collisionCtx = collisionCanvas.getContext('2d');
	const CANVAS_WIDTH =
		(canvas.width =
		collisionCanvas.width =
			window.innerWidth);
	const CANVAS_HEIGHT =
		(canvas.height =
		collisionCanvas.height =
			window.innerHeight);

	let timeToNextRaven = 0;
	let ravenInterval = 1000;

	let score = 0;
	let clicks = 0;

	let gameOver = false;
	ctx.font = ' 50px Impact ';

	let ravens = [];

	class Raven {
		constructor() {
			this.image = new Image();
			this.image.src = './assets/raven.png';
			this.spriteWidth = 271;
			this.spriteHeight = 194;
			this.sizeModifier = Math.random() * 0.6 + 0.5;
			this.width = this.spriteWidth * this.sizeModifier;
			this.height = this.spriteHeight * this.sizeModifier;
			this.x = Math.random() * CANVAS_WIDTH + CANVAS_WIDTH;
			this.y = Math.random() * (CANVAS_HEIGHT - this.height);
			this.directionX = Math.random() * 10 + 3;
			this.directionY = Math.random() * 5 - 2.5;
			this.toDelete = false;
			this.frame = 0;
			this.maxFrame = 5;
			this.timeSinceFlap = 0;
			this.flapInterval = Math.random() * 50 + 100;
			this.randomColor = [
				Math.floor(Math.random() * 256),
				Math.floor(Math.random() * 256),
				Math.floor(Math.random() * 256),
			];
			this.hitboxColor = `rgb(${this.randomColor[0]},${this.randomColor[1]},${this.randomColor[2]})`;
			this.sound = new Audio('./assets/caw.wav');
		}
		update(deltaTime) {
			this.x -= this.directionX;
			this.y += this.directionY;

			if (this.y < 0 || this.y > CANVAS_HEIGHT - this.height) {
				this.directionY *= -1;
			}

			this.timeSinceFlap += deltaTime;
			if (this.timeSinceFlap > this.flapInterval) {
				if (this.frame < this.maxFrame) {
					this.frame++;
				} else this.frame = 0;
				this.timeSinceFlap = 0;
			}
			if (this.x < 0 - this.width && !gameOver) {
				canvas.style.background = 'firebrick';
				this.toDelete = true;
				this.sound.play();
				setTimeout(() => {
					gameOver = true;
				}, 1400);
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
		let accuracy = (score / clicks) * 100 || 0;
		ctx.fillStyle = 'grey';
		ctx.fillText(`🐔 ${score}`, 50, 100);
		ctx.fillText(`🎯 ${accuracy.toFixed(1)}%`, 50, 170);
		ctx.fillStyle = 'black';
		ctx.fillText(`🐔 ${score}`, 48, 98);
		ctx.fillText(`🎯 ${accuracy.toFixed(1)}%`, 48, 168);
	}

	function drawGameOver() {
		ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
		ctx.fillStyle = 'white';

		ctx.save();
		ctx.font = '120px Impact';
		ctx.textAlign = 'center';
		ctx.fillText(`GAME OVER`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
		ctx.restore();

		ctx.save();
		ctx.font = 'bold 35px Calibri';
		ctx.textAlign = 'center';
		ctx.fillText(
			`PRESS SPACE TO TRY AGAIN`,
			CANVAS_WIDTH / 2,
			CANVAS_HEIGHT / 2 + 75
		);
		ctx.restore();

		let accuracy = (score / clicks) * 100 || 0;
		ctx.fillText(`🐔 ${score}`, 48, 98);
		ctx.fillText(`🎯 ${accuracy.toFixed(1)}%`, 48, 168);
	}

	window.addEventListener('click', (e) => {
		clicks++;

		const detectPixelColor = collisionCtx.getImageData(e.x, e.y, 1, 1);
		//getImageData returns array of srbg values of the clicked image
		const pixelColor = [...detectPixelColor.data].splice(0, 3).join('');

		if (pixelColor === '000' && !gameOver) {
			const ricochet = new Audio('./assets/ricochet.mp3');
			ricochet.play();
		}
		//turning the srbg into an identifier key for individual ravens
		ravens.map((obj) => {
			if (obj.randomColor.join('') === pixelColor && !gameOver) {
				//collision detected
				obj.toDelete = true;

				score++;
				ravenInterval += 10;
				explosions.push(new Explosion(obj.x, obj.y, obj.width));

				obj.sound.play();
			}
		});
		if (ravenInterval > 200) {
			ravenInterval -= 20;
		}
	});

	window.addEventListener('keyup', (e) => {
		if (e.key === ' ' && gameOver) {
			const reload = new Audio('./assets/reload.wav');
			reload.play();
			setTimeout(() => {
				gameOver = false;
				reset();
			}, 1500);
		}
	});
	window.addEventListener('click', (e) => {
		if (gameOver) {
			const reload = new Audio('./assets/reload.wav');
			reload.play();
			setTimeout(() => {
				gameOver = false;
				reset();
			}, 1500);
		}
	});
	function reset() {
		canvas.style.background = 'hsl(0, 0%, 90%)';
		score = 0;
		clicks = 0;
		ravens = [];
		explosions = [];
		ravenInterval = 1000;
		animate(0);
	}

	function spawn() {
		for (let i = 0; i < 1; i++) {
			ravens.push(new Raven());
		}
	}

	const fps = 60;
	const frameInterval = 1000 / fps;
	let lastTime = 0;

	function animate(timestamp) {
		if (!gameOver) {
			requestAnimationFrame(animate);
		}
		let deltaTime = timestamp - lastTime;
		if (deltaTime < frameInterval) return;

		ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
		collisionCtx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
		drawScore();

		timeToNextRaven += deltaTime;
		if (timeToNextRaven >= ravenInterval) {
			spawn();
			timeToNextRaven = 0;
			ravens.sort((a, b) => {
				return a.width - b.width;
			});
		}

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

		if (gameOver) {
			drawGameOver();
		}

		const excessTime = deltaTime % frameInterval;
		lastTime = timestamp - excessTime;
	}

	animate(0);
});
