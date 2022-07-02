const worldBorder = (target) => {
	const movement = { a: true, d: true, ArrowLeft: true, ArrowRight: true };
	if (target == player) {
		if (target.position.x <= 0) {
			movement.a = false;
			return movement;
		} else if (target.position.x + target.width >= canvas.width) {
			movement.d = false;
			return movement;
		}
	} else {
		if (target.position.x <= 0) {
			movement.ArrowLeft = false;
			return movement;
		} else if (target.position.x + target.width >= canvas.width) {
			movement.ArrowRight = false;
			return movement;
		}
	}
	return movement;
};

const detectCondition = ({ playerOne, playerTwo }) => {
	return (
		playerOne.attackbox.position.x + playerOne.attackbox.width >= playerTwo.position.x &&
		playerOne.attackbox.position.x <= playerTwo.position.x + playerTwo.width &&
		playerOne.attackbox.position.y + playerOne.attackbox.height >= playerTwo.position.y &&
		playerOne.attackbox.position.y <= playerTwo.position.y + playerTwo.height
	);
};

const determineWinner = () => {
	if (player.health == enemy.health) {
		showWinner("tie");
	} else if (player.health > enemy.health) {
		socket.emit("determineWinner" , {nickName :localStorage.getItem("nickname"),socketId : localStorage.getItem("socketId") , winner: "firstPlayer" })
	} else {
		socket.emit("determineWinner" , {nickName :localStorage.getItem("nickname"),socketId : localStorage.getItem("socketId") , winner: "secondPlayer" })
	}
};

const refresh = () => {
	setTimeout(() => {
		location.reload();
	}, 3000);
};

const showWinner = (message) => {
	const victory = document.querySelector("#victory");
	victory.innerHTML = message;
	victory.classList = "d-block";
	refresh();
};

let time = 60;
const timer = () => {
	if (time != 0) {
		setTimeout(timer, 1000);
		time--;
	} else if (time == 0) {
		determineWinner();
	}
	document.querySelector("#timer").innerHTML = time;
};
