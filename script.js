window.addEventListener('load', () => {
	/** @type {HTMLCanvasElement} */
	const canvas = document.getElementById('canvas1');
	const ctx = canvas.getContext('2d');
	const collisionCanvas = document.getElementById('collisionCanvas');
	const collisionCtx = collisionCanvas.getContext('2d');
	const CANVAS_WIDTH = (canvas.width = collisionCanvas.width = 1200);
	const CANVAS_HEIGHT = (canvas.height = collisionCanvas.height = 600);

	class Game {
		constructor(width, height) {
			this.width = width;
			this.height = height;
			this.ravens = [];
			this.explosions = [];
			this.score = 0;
			this.clicks = 0;
			this.timeToNextRaven = 0;
			this.ravenInterval = 1000;
			this.accuracy = 0;
			this.gameOver = false;
			console.log(window.innerWidth);

			//for desktop
			if (window.innerWidth >= this.width) {
				window.addEventListener('click', (e) => {
					this.clicks++;
					const rect = canvas.getBoundingClientRect();
					const detectPixelColor = collisionCtx.getImageData(
						e.x - rect.x,
						e.y - rect.y,
						1,
						1
					);
					//getImageData returns array of srbg values of the clicked image
					const pixelColor = [...detectPixelColor.data].splice(0, 3).join('');

					if (pixelColor === '000' && !this.gameOver) {
						const ricochet = new Audio('./assets/ricochet.mp3');
						ricochet.play();
					}
					//turning the srbg into an identifier key for individual ravens
					this.ravens.map((obj) => {
						if (obj.randomColor.join('') === pixelColor && !this.gameOver) {
							//collision detected
							obj.toDelete = true;

							this.score++;
							this.ravenInterval += 10;
							this.explosions.push(
								new Explosion(this, obj.x, obj.y, obj.width)
							);

							obj.sound.play();
						}
					});
					if (this.ravenInterval > 200) {
						this.ravenInterval -= 20;
					}

					if (this.gameOver) {
						const reload = new Audio('./assets/reload.wav');
						reload.play();
						setTimeout(() => {
							this.reset();
						}, 1500);
					}
				});
			} else {
				//for mobile
				window.addEventListener('touchstart', (e) => {
					this.clicks++;
					const rect = canvas.getBoundingClientRect();

					const detectPixelColor = collisionCtx.getImageData(
						e.touches[0].clientX - rect.x,
						e.touches[0].clientY - rect.y,
						1,
						1
					);

					//getImageData returns array of srbg values of the clicked image
					const pixelColor = [...detectPixelColor.data].splice(0, 3).join('');

					if (pixelColor === '000' && !this.gameOver) {
						const ricochet = new Audio('./assets/ricochet.mp3');
						ricochet.play();
					}
					//turning the srbg into an identifier key for individual ravens
					this.ravens.map((obj) => {
						if (obj.randomColor.join('') === pixelColor && !this.gameOver) {
							//collision detected
							obj.toDelete = true;

							this.score++;
							this.ravenInterval += 10;
							this.explosions.push(
								new Explosion(this, obj.x, obj.y, obj.width)
							);

							obj.sound.play();
						}
					});
					if (this.ravenInterval > 200) {
						this.ravenInterval -= 20;
					}

					if (this.gameOver) {
						const reload = new Audio('./assets/reload.wav');
						reload.play();
						setTimeout(() => {
							this.reset();
						}, 1500);
					}
				});
				window.addEventListener('keyup', (e) => {
					if (e.key === ' ' && this.gameOver) {
						const reload = new Audio('./assets/reload.wav');
						reload.play();
						setTimeout(() => {
							this.reset();
						}, 1500);
					}
				});
			}
		}
		draw(context, collisionContext) {
			context.font = ' 35px Impact ';
			//draw score
			this.drawScore(context);
			//draw objects in ravens and explosions array
			[...this.ravens, ...this.explosions].forEach((obj) => {
				obj.draw(context, collisionContext);
			});
		}
		update(deltaTime) {
			this.accuracy = (this.score / this.clicks) * 100 || 0;
			this.timeToNextRaven += deltaTime;
			if (this.timeToNextRaven >= this.ravenInterval) {
				this.spawn();
				this.timeToNextRaven = 0;
				this.ravens.sort((a, b) => {
					return a.width - b.width;
				});
			}
			//update objects in ravens and explosions array
			[...this.ravens, ...this.explosions].forEach((obj) => {
				obj.update(deltaTime);
			});
			// to remove ravens & explosions which are out of screen from the ravens array
			this.ravens = this.ravens.filter((obj) => {
				return !obj.toDelete;
			});
			this.explosions = this.explosions.filter((obj) => {
				return !obj.toDelete;
			});
		}
		drawScore(context) {
			context.fillStyle = 'grey';
			context.fillText(`🐔 ${this.score}`, this.width * 0.05, 80);
			context.fillText(
				`🎯 ${this.accuracy.toFixed(1)}%`,
				this.width * 0.05,
				130
			);
			context.fillStyle = 'black';
			context.fillText(`🐔 ${this.score}`, this.width * 0.05 - 2, 78);
			context.fillText(
				`🎯 ${this.accuracy.toFixed(1)}%`,
				this.width * 0.05 - 2,
				128
			);
		}
		drawGameOver(context) {
			context.fillRect(0, 0, this.width, this.height);
			context.fillStyle = 'white';

			context.save();
			context.font = '80px Impact';
			context.textAlign = 'center';
			context.fillText(`GAME OVER`, this.width / 2, this.height / 2);
			context.restore();

			context.save();
			context.font = 'bold 30px Calibri';
			context.textAlign = 'center';
			context.fillText(
				`PRESS SPACE TO TRY AGAIN`,
				this.width / 2,
				this.height / 2 + 75
			);
			context.restore();

			context.fillText(`🐔 ${this.score}`, this.width * 0.05, 80);
			context.fillText(
				`🎯 ${this.accuracy.toFixed(1)}%`,
				this.width * 0.05,
				130
			);
		}
		reset() {
			canvas.style.background = 'hsl(0, 0%, 90%)';
			this.score = 0;
			this.clicks = 0;
			this.ravens = [];
			this.explosions = [];
			this.ravenInterval = 1000;
			this.gameOver = false;
			animate(0);
		}
		spawn() {
			for (let i = 0; i < 1; i++) {
				this.ravens.push(new Raven(this));
			}
		}
	}

	class Raven {
		constructor(game) {
			this.game = game;
			this.image = new Image();
			this.image.src = './assets/raven.png';
			this.spriteWidth = 271;
			this.spriteHeight = 194;
			this.sizeModifier = Math.random() * 0.5 + 0.6;
			this.width = this.spriteWidth * this.sizeModifier;
			this.height = this.spriteHeight * this.sizeModifier;
			this.x = Math.random() * this.game.width + this.game.width;
			this.y = Math.random() * (this.game.height - this.height);
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

			if (this.y < 0 || this.y > this.game.height - this.height) {
				this.directionY *= -1;
			}

			this.timeSinceFlap += deltaTime;
			if (this.timeSinceFlap > this.flapInterval) {
				if (this.frame < this.maxFrame) {
					this.frame++;
				} else this.frame = 0;
				this.timeSinceFlap = 0;
			}
			if (this.x < 0 - this.width && !this.game.gameOver) {
				canvas.style.background = 'firebrick';
				this.toDelete = true;
				this.sound.play();
				setTimeout(() => {
					this.game.gameOver = true;
				}, 1400);
			}
		}
		draw(context, collisionContext) {
			collisionContext.fillStyle = this.hitboxColor;
			collisionContext.fillRect(this.x, this.y, this.width, this.height);
			context.drawImage(
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

	class Explosion {
		constructor(game, x, y, size) {
			this.game = game;
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
		draw(context) {
			context.drawImage(
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

	const game = new Game(CANVAS_WIDTH, CANVAS_HEIGHT);

	const fps = 60;
	const frameInterval = 1000 / fps;
	let lastTime = 0;

	function animate(timestamp) {
		if (!game.gameOver) {
			requestAnimationFrame(animate);
		}
		let deltaTime = timestamp - lastTime;
		if (deltaTime < frameInterval) return;

		ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
		collisionCtx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
		game.draw(ctx, collisionCtx);
		game.update(deltaTime);
		if (game.gameOver) {
			game.drawGameOver(ctx);
		}

		const excessTime = deltaTime % frameInterval;
		lastTime = timestamp - excessTime;
	}

	animate(0);
});
