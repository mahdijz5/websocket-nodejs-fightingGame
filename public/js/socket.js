const socket = io();

const userList = document.querySelector("#userList");
const inviteCard = document.querySelector("#inviteCard");
const denyMsg = document.querySelector("#denyMsg");

const name = localStorage.getItem("nickname");

const request = (id) => {
    const requester = socket.id;
    const target = id;
    if(requester == target) return 
    console.log(`from ${requester} to ${target}`)
    socket.emit("request",{
        requester,
        target,
    })
}

socket.emit("online", {
	name,
});

//* listening

socket.on("online", (users) => {
	if(userList){
        while (userList.firstChild) {
            userList.removeChild(userList.firstChild);
        }
        for (const id in users) {
            if(id != socket.id) {
            const newUser = document.createElement("a");
            newUser.setAttribute("class", "link text-white bg-primary d-block");
            newUser.setAttribute("onclick", `request("${id}")`);
            newUser.setAttribute("id", id);
            newUser.innerHTML = users[id];
    
            userList.appendChild(newUser);
            }
        }
    }
});

socket.on("sendRequest" , (data) => {
    document.querySelector("#requestMsg").innerHTML = `${data.requesterName} has invited you to fight`;
    inviteCard.classList = "messageCard";
    

    //answer
    document.querySelector("#denyBtn").addEventListener("click" , () => {
        socket.emit("answerRequest" , {
            answer : false,
            requester : data.requester,
            target : data.target
        })
        inviteCard.classList = "d-none messageCard";
    })
    document.querySelector("#acceptBtn").addEventListener("click" , () => {
        socket.emit("answerRequest" , {
            answer : true,
            requester : data.requester,
            target : data.target
        })
        inviteCard.classList = "d-none messageCard";
    })
})

socket.on("join fight" , ( {requester ,target , lobbyName}) => {
    socket.emit("join fight" , {requester ,target , lobbyName})
})

socket.on("deny message" , () => {
    denyMsg.classList = "messageCard";
    document.querySelector("#closeBtn").addEventListener("click" , () => {
        denyMsg.classList = "d-none messageCard";
    })
    
})

socket.on("replace to game", ({requester ,target , lobbyName ,socketId}) => {
    localStorage.setItem("requester" , requester )
    localStorage.setItem("target" ,target )
    localStorage.setItem("lobbyName" ,lobbyName )
    localStorage.setItem("socketId" ,socketId )
    timer();
    document.querySelector("#lobbyBody").classList = "d-none";
    document.querySelector("#gameBody").classList = "";
})

