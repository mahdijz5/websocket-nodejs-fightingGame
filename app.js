const http = require("http");
const express = require('express')

const {Server , Socket} = require('socket.io');

const app = express()
const server = http.createServer(app)
const io = new Server(server)

app.use(express.static('public'))


server.listen(3000 ,() => {
    console.log("running...")
})

const onlineUsers = {}
io.on('connection',(socket)=> {
    const id = socket.id;
    socket.join("lobby")
    console.log(id)

    
    const leaveRooms =() => {
        socket.rooms.forEach(room => {
            socket.leave(room)
        });
        delete onlineUsers[socket.id] 
        io.to("lobby").emit("online",onlineUsers)
    }


    //Listening
    socket.on('online' , (data) => {
        onlineUsers[id] = data.name;
        
        io.to("lobby").emit("online",onlineUsers)
    })

    socket.on("disconnect", () => {
        console.log(`User ${id} be call ${onlineUsers[id]} disconnected.`);
        delete onlineUsers[id] 
        io.to("lobby").emit("online",onlineUsers)
    });

    socket.on("request" , ({requester ,target}) => {
        io.to(target).emit("sendRequest" , {
            requester,
            requesterName : onlineUsers[requester],
            target,
        })
    })

    socket.on("answerRequest" , ({answer ,requester ,target}) => {
        if(answer) {
            leaveRooms()
            socket.join(`${requester}Lobby`);
            socket.join(socket.id);
            io.to(socket.id).emit('replace to game' , {requester ,target , lobbyName:`${requester}Lobby`, socketId: socket.id})
            io.to(requester).emit("join fight" , {requester ,target , lobbyName : `${requester}Lobby`} )
        }else {
            io.to(requester).emit("deny message")
        }
    })
    
    socket.on("join fight" , ({requester ,target , lobbyName}) => {
        leaveRooms()
        socket.join(lobbyName);
        socket.join(socket.id);
        io.to(socket.id).emit('replace to game' , {requester ,target , lobbyName,socketId: socket.id})
    })


    //* IN GAME

    socket.on("movement" , ({from,to,lobbyName,keydown,movement}) => {
        io.to(lobbyName).emit("movement",{from,keydown,movement,lobbyName})
    })

    socket.on("determineWinner" , ({nickName,socketId,winner}) => {
        io.to(socketId).emit("determineWinner",{nickName,socketId,winner})
    })

    socket.on("showWinner" , ({nickName,lobbyName}) => {
        console.log(nickName)
        io.to(lobbyName).emit("showWinner", {winMsg :`${nickName} won`})
    })
})


