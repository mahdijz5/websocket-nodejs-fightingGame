const background = new Environment({
	position: {
		x: 0,
		y: 0,
	},
	height: canvas.height,
	width: canvas.width,
	imageSrc: "./img/background.png",
});

const firstPlayer = () => {
	return localStorage.getItem("requester")
}
const secondPlayer = () => {
	return localStorage.getItem("target")
	
}
const lobbyName = () => {
	return localStorage.getItem("lobbyName")
	
}
const socketId = () => {
	return localStorage.getItem("socketId")

}

const player = new Champion({
	name: "player",
	position: {
		x: 20,
		y: 0,
	},
	vlocity: {
		x: 0,
		y: 0,
	},
	imageSrc: "./img/darkWizard/idle.png",
	frameMax: 10,
	offset: {
		x: 145,
		y: 94,
	},
	scale: 2,

	attackbox: {
		height: 78,
		width: 75,
		offset: {
			x: -50,
			y: -20,
		},
	},

	champions: {
		idle: {
			imageSrc: "./img/darkWizard/idle.png",
			frameMax: 10,
		},
		run: {
			imageSrc: "./img/darkWizard/run.png",
			frameMax: 8,
		},
		fall: {
			imageSrc: "./img/darkWizard/fall.png",
			frameMax: 3,
		},
		jump: {
			imageSrc: "./img/darkWizard/jump.png",
			frameMax: 3,
		},
		attack2: {
			imageSrc: "./img/darkWizard/attack2.png",
			frameMax: 7,
		},
		death: {
			imageSrc: "./img/darkWizard/death.png",
			frameMax: 7,
		},
		hit: {
			imageSrc: "./img/darkWizard/hit.png",
			frameMax: 3,
		},
		reverseRun: {
			imageSrc: "./img/darkWizard/reverseRun.png",
			frameMax: 8,
		},
	},
});

const enemy = new Champion({
	name: "enemy",
	position: {
		x: 960,
		y: 0,
	},
	vlocity: {
		x: 0,
		y: 0,
	},
	imageSrc: "./img/darkKnight/idle.png",
	frameMax: 8,
	scale: 1.9,
	offset: {
		x: 125,
		y: 85,
	},
	attackbox: {
		height: 50,
		width: 100,
		offset: {
			x: 100,
			y: -18,
		},
	},
	champions: {
		idle: {
			imageSrc: "./img/darkKnight/idle.png",
			frameMax: 8,
		},
		run: {
			imageSrc: "./img/darkKnight/run.png",
			frameMax: 8,
		},
		reverseRun: {
			imageSrc: "./img/darkKnight/runForward.png",
			frameMax: 8,
		},
		fall: {
			imageSrc: "./img/darkKnight/fall.png",
			frameMax: 2,
		},
		jump: {
			imageSrc: "./img/darkKnight/jump.png",
			frameMax: 2,
		},
		hit: {
			imageSrc: "./img/darkKnight/hit.png",
			frameMax: 4,
		},
		death: {
			imageSrc: "./img/darkKnight/death.png",
			frameMax: 6,
		},
		attack2: {
			imageSrc: "./img/darkKnight/attack2.png",
			frameMax: 4,
		},
	},
});

player.draw();

enemy.draw();

const keys = {
	a: {
		pressed: false,
	},
	d: {
		pressed: false,
	}, 
	ArrowLeft: {
		pressed: false,
	}, 
	ArrowRight: {
		pressed: false,
	}, 
};



const renderer = () => {
	window.requestAnimationFrame(renderer);
	(c.fillStyle = "black"), c.fillRect(0, 0, canvas.width, canvas.height);
	background.update();
	enemy.update();
	player.update();

	player.vlocity.x = 0;
	enemy.vlocity.x = 0;

	//!Die animation
	if (enemy.health <= 0) {
		enemy.die();
	}
	if (player.health <= 0) {
		player.die();
	}
	
	if (keys.a.pressed && player.lastKey == "a") {
		if (worldBorder(player).a) player.vlocity.x = -6;
		player.animation('reverseRun')
	}else if (keys.d.pressed && player.lastKey == "d") {
		if (worldBorder(player).d) player.vlocity.x = 6;
		player.animation('run')
	}else{
		player.animation('idle')
	}

	// !enemy movement
	if (keys.ArrowRight.pressed && enemy.lastKey == "d") {
		if (worldBorder(enemy).ArrowRight) enemy.vlocity.x = 6;
		enemy.animation('run')
	} else if (keys.ArrowLeft.pressed && enemy.lastKey == "a") {
		if (worldBorder(enemy).ArrowLeft) enemy.vlocity.x = -6;
		enemy.animation('reverseRun')
	}else {
		enemy.animation('idle')
	}
	//!detect colision
	if (
		detectCondition({ playerOne: player, playerTwo: enemy }) &&
		player.isAttacking
	) {
		enemy.takeHit();
		player.isAttacking = false;
	}
	if (
		detectCondition({ playerOne: enemy, playerTwo: player }) &&
		enemy.isAttacking
	) {
		player.takeHit();
		enemy.isAttacking = false;
	}
	gsap.to("#enemyHealthBar", {
		width: enemy.health + "%",
	});
	gsap.to("#playerHealthBar", {
		width: player.health + "%",
	});
	if (player.health == 0) {
		socket.emit("determineWinner" , {nickName :localStorage.getItem("nickname"),socketId : localStorage.getItem("socketId") , winner: "secondPlayer" })
	} else if (enemy.health == 0) {
		socket.emit("determineWinner" , {nickName :localStorage.getItem("nickname"),socketId : localStorage.getItem("socketId") , winner: "firstPlayer" })
	}
	//! Animation
	
	if (player.vlocity.y < 0) {
		player.animation("jump");
	} else if (player.vlocity.y > 0) {
		player.animation("fall");
	}
	if (enemy.vlocity.y < 0) {
		enemy.animation("jump");
	} else if (enemy.vlocity.y > 0) {
		enemy.animation("fall");
	}
	
};

renderer();

//* ////////////////////////////////////////////// KEY CHECK ///////////////////////////////////////////////

window.addEventListener("keydown", (event) => {
	if (enemy.dead || player.dead) return;
	
	switch (event.key) {
		case "a":

			if (socketId() == firstPlayer()) {
				socket.emit("movement",{
					from : firstPlayer(),
					to : secondPlayer(),
					lobbyName: lobbyName(),
					keydown : true,
					movement : "a",
				})
				
			} else if (socketId() == secondPlayer()) {
				socket.emit("movement",{
					from : secondPlayer(),
					to : firstPlayer(),
					lobbyName: lobbyName(),
					keydown : true,
					movement : "a",
				})
			}
			break;

		case "d":

			if (socketId() == firstPlayer()) {
				socket.emit("movement",{
					from : firstPlayer(),
					to : secondPlayer(),
					lobbyName: lobbyName(),
					keydown : true,
					movement : "d",
				})
			} else if (socketId() == secondPlayer()) {
				socket.emit("movement",{
					from : secondPlayer(),
					to : firstPlayer(),
					lobbyName: lobbyName(),
					keydown : true,
					movement : "d",
				})
			}
			break;

		case "w":
			if (player.position.y >= 426 && socketId() == firstPlayer()) {
				socket.emit("movement",{
					from : firstPlayer(),
					to : secondPlayer(),
					lobbyName: lobbyName(),
					movement : "w",
				})
			}
			if (enemy.position.y >= 426 && socketId() == secondPlayer()) {
				socket.emit("movement",{
					from : secondPlayer(),
					to : firstPlayer(),
					lobbyName: lobbyName(),
					movement : "w",
				})
			}
			break;

		case " ":

			if (socketId() == firstPlayer()) {
				socket.emit("movement",{
					from : firstPlayer(),
					to : secondPlayer(),
					lobbyName: lobbyName(),
					movement : " ",
				})
			} else if (socketId() == secondPlayer()) {
				socket.emit("movement",{
					from : secondPlayer(),
					to : firstPlayer(),
					lobbyName: lobbyName(),
					movement : " ",
				})
			}

			break;

	}
});

window.addEventListener("keyup", (event) => {
	switch (event.key) {
		case "a":
			if (socketId() == firstPlayer()) {
				socket.emit("movement",{
					from : firstPlayer(),
					to : secondPlayer(),
					lobbyName: lobbyName(),
					keydown : false,
					movement : "a",
				})
				
			} else if (socketId() == secondPlayer()) {
				socket.emit("movement",{
					from : secondPlayer(),
					to : firstPlayer(),
					lobbyName: lobbyName(),
					keydown : false,
					movement : "a",
				})
			}
			break;
		case "d":
			if (socketId() == firstPlayer()) {
				socket.emit("movement",{
					from : firstPlayer(),
					to : secondPlayer(),
					lobbyName: lobbyName(),
					keydown : false,
					movement : "d",
				})
			} else if (socketId() == secondPlayer()) {
				socket.emit("movement",{
					from : secondPlayer(),
					to : firstPlayer(),
					lobbyName: lobbyName(),
					keydown : false,
					movement : "d",
				})
			}
			break;
	}
});

//* ////////////////////////////////////////////// SEND MOVEMENT TO SOCKET ///////////////////////////////////////////////

//!ENEMY MOVEMENT
socket.on("movement" , ({from,keydown,movement}) => {	
	switch(movement){

		case "a" : //TODO MOVE LEFT

			if(keydown) { //key down

				if(from == firstPlayer()) {
					player.lastKey = "a";
					keys.a.pressed = true;
				}else if(from == secondPlayer()) {
					enemy.lastKey = "a";
					keys.ArrowLeft.pressed = true;
				}

			}else { //key up

				if(from == firstPlayer()) {
					keys.a.pressed =false;
				}else if(from == secondPlayer()) {
					keys.ArrowLeft.pressed = false;
				}
			}
		break;

		case "d" :  //TODO MOVE RIGHT
			if(keydown) {    //key down
				
				if(from == firstPlayer()) {
					player.lastKey = "d";
					keys.d.pressed = true;
				}else if(from == secondPlayer()) {
					enemy.lastKey = "d";
					keys.ArrowRight.pressed = true;
				}

			}else { //key up
				
				if(from == firstPlayer()) {
					keys.d.pressed =false;
				}else if(from == secondPlayer()) {
					keys.ArrowRight.pressed = false;
				}

			}
		break;

		case "w" : 
	
			if(from == firstPlayer()) {
				player.vlocity.y = -20;
			}else if(from == secondPlayer()) {
				enemy.vlocity.y = -20;
			}
		
		break;

		case " " : 
	
			if(from == firstPlayer()) {
				player.attack()
			}else if(from == secondPlayer()) {
				enemy.attack()
			}
		
		break;

	}
	
})


//! determine winner

socket.on("determineWinner" , ({ nickName,socketId,winner}) => {
	if(winner == "firstPlayer") {
		if(socketId == firstPlayer()) {
			console.log("heyyyyyyyyyy")
			socket.emit("showWinner" , {nickName , lobbyName :lobbyName()})
		}
	}else if(winner == "secondPlayer"){
		if(socketId == secondPlayer()) {
			socket.emit("showWinner" , {nickName , lobbyName :lobbyName()})
		}
	}
})

socket.on("showWinner" , ({winMsg}) => {
	showWinner(winMsg);
})