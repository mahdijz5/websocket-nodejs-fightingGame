const canvas = document.querySelector("canvas");
const c = canvas.getContext("2d");

canvas.width = 1024;
canvas.height = 576;

c.fillRect(0, 0, canvas.width, canvas.height);

const gravity = 0.7;

class Environment {
	constructor({
		position,
		name,
		imageSrc,
		scale = 1,
		height,
		width,
		frameMax = 1,
		offset = { x: 0, y: 0 },
	}) {
		this.position = position;
		this.height = height;
		this.width = width;
		this.image = new Image();
		this.image.src = imageSrc;
		this.scale = scale;
		this.frameMax = frameMax;
		this.currentFrame = 0;
		this.frameElapsed = 0;
		this.frameHold = 5;
		this.offset = offset;
	}

	draw() {
		c.drawImage(
			this.image,
			this.currentFrame * (this.image.width / this.frameMax),
			0,
			this.image.width / this.frameMax,
			this.image.height,
			this.position.x - this.offset.x,

			this.position.y - this.offset.y,
			(this.image.width / this.frameMax) * this.scale,
			this.image.height * this.scale
		);
	}

	animateFrames() {
		this.frameElapsed++;
		if (this.frameElapsed % this.frameHold == 0) {
			if (this.currentFrame < this.frameMax - 1) {
				this.currentFrame++;
			} else {
				this.currentFrame = 0;
			}
		}
	}

	update() {
		this.draw();
		this.animateFrames();
	}
}

class Champion extends Environment {
	constructor({
		vlocity,
		name,
		color = "green",
		frameMax = 1,
		offset = { x: 0, y: 0 },
		scale = 1,
		position,
		champions,
		imageSrc,
		attackbox = {height:undefined,width:undefined,offset : {} }
	}) {
		super({
			imageSrc,
			position,
			frameMax,
			scale,
			offset,
		});

		this.name = name;
		this.vlocity = vlocity;
		this.height = 150;
		this.width = 50;
		this.lastKey;
		this.currentFrame = 0;
		this.frameElapsed = 0;
		this.frameHold = 5;
		this.health = 100;
		this.attackbox = {
			position: {
				x: this.position.x,
				y: this.position.y,
			},
			offset : attackbox.offset,
			height: attackbox.height,
			width: attackbox.width,
		};
		this.color = color;
		this.isAttacking = false;
		this.champions = champions;
		this.dead = false;

		for (const champion in this.champions) {
			champions[champion].image = new Image();
			champions[champion].image.src = champions[champion].imageSrc;
		}
	}

	die() {
		this.animation("death")
	}

	takeHit() {
		this.animation("hit")
		this.health += -10;
	}

	attack() {
		this.animation("attack2")
		this.isAttacking = true;
		setTimeout(() => {
			this.isAttacking = false;
		}, 100);
	}

	animation(mode) {
		if(this.image == this.champions.attack2.image && this.currentFrame < this.champions.attack2.frameMax-1) return

		if(this.image == this.champions.hit.image && this.currentFrame < this.champions.hit.frameMax-1) return
		
		if(this.image == this.champions.death.image ) {
			if(this.currentFrame == this.champions.death.frameMax- 1) {
				this.dead=true
			}
			return
		}

		if (!this.dead) {
			switch (mode) {
				case "idle":
					if (this.image !== this.champions.idle.image) {
						this.image = this.champions.idle.image;
						this.frameMax = this.champions.idle.frameMax;
						this.currentFrame = 0;
					}
					break;
				case "run":
					if (this.image !== this.champions.run.image) {
						this.currentFrame = 0;
						this.image = this.champions.run.image;
						this.frameMax = this.champions.run.frameMax;
					}
					break;
				case "reverseRun":
					if (this.image !== this.champions.reverseRun.image) {
						this.currentFrame = 0;
						this.image = this.champions.reverseRun.image;
						this.frameMax = this.champions.reverseRun.frameMax;
					}
					break;
				case "jump":
					if (this.image !== this.champions.jump.image) {
						this.image = this.champions.jump.image;
						this.frameMax = this.champions.jump.frameMax;
						this.currentFrame = 0;
					}
					break;
				case "fall":
					if (this.image !== this.champions.fall.image) {
						this.image = this.champions.fall.image;
						this.frameMax = this.champions.fall.frameMax;
						this.currentFrame = 0;
					}
					break;
				case "hit":
					if (this.image !== this.champions.hit.image) {
						this.image = this.champions.hit.image;
						this.frameMax = this.champions.hit.frameMax;
						this.currentFrame = 0;
					}
					break;
				case "death":
					if (this.image !== this.champions.death.image) {
						this.image = this.champions.death.image;
						this.frameMax = this.champions.death.frameMax;
						this.currentFrame = 0;
					}
					break;
				case "attack2":
					if (this.image !== this.champions.attack2.image) {
						this.image = this.champions.attack2.image;
						this.frameMax = this.champions.attack2.frameMax;
						this.currentFrame = 0;
					}
					break;
			}
		}
	}

	update() {
		if(!this.dead ) this.animateFrames();
		this.draw()
		this.position.y += this.vlocity.y;
		this.position.x += this.vlocity.x;
		this.attackbox.position.x = this.position.x - this.attackbox.offset.x;
		this.attackbox.position.y = this.position.y - this.attackbox.offset.y;

		// c.fillRect(this.attackbox.position.x,this.attackbox.position.y , this.attackbox.width , this.attackbox.height )

		// c.fillRect(this.position.x,this.position.y , this.width , this.height )

		if (this.position.y + this.height + this.vlocity.y >= canvas.height) {
			this.vlocity.y = 0;
			this.position.y = 426;
		} else {
			this.vlocity.y += gravity;
		}
	}
}
