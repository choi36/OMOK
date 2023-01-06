const express = require('express');
const http = require('http');
const app = express();
const path = require('path');
const server = http.createServer(app);

const socketIO = require('socket.io');

const io = socketIO(server);




let usersId = {};
let players = [undefined, undefined];
var board = [
    [3,3,3,3,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,3,3,3,3],
    [3,3,3,3,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,3,3,3,3],
    [3,3,3,3,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,3,3,3,3],
    [3,3,3,3,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,3,3,3,3],
    [3,3,3,3,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,3,3,3,3],
    [3,3,3,3,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,3,3,3,3],
    [3,3,3,3,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,3,3,3,3],
    [3,3,3,3,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,3,3,3,3],
    [3,3,3,3,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,3,3,3,3],
    [3,3,3,3,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,3,3,3,3],
    [3,3,3,3,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,3,3,3,3],
    [3,3,3,3,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,3,3,3,3],
    [3,3,3,3,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,3,3,3,3],
    [3,3,3,3,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,3,3,3,3],
    [3,3,3,3,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,3,3,3,3],
    [3,3,3,3,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,3,3,3,3],
    [3,3,3,3,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,3,3,3,3],
    [3,3,3,3,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,3,3,3,3],
    [3,3,3,3,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,3,3,3,3],
    [3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3],
    [3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3],
    [3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3],
    [3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3],
];
var turn = 1
var chatting = [];




app.use(express.static(path.join(__dirname, 'src')));
const PORT = process.env.PORT || 5000;



io.on('connection', (socket) => {
    console.log(`${socket.id} conncected`);
    socket.emit('sendId', socket.id);

    socket.on('userConnect', (msg) => {
        socket.emit('selectNickname', socket.id);
        socket.emit('giveBoard', board);
        
    })

    socket.on('sendNickname', (data) => {
        let id = data[0];
        let nickname = data[1];
        if(existCheck(nickname) == 0) {
            usersId[id] = nickname;
            socket.emit('situationUpdate', 0);
            console.log(players);
            console.log(usersId);
            io.emit('userChange', [usersId, players]);
        } else {
            socket.emit('selectNickname', id);
        }
    })

    socket.on('userParticipate', (id) => {
        if(players.includes(usersId[id]) == false) {
            if(players[0] == undefined) {
                players[0] = usersId[id];
                socket.emit('situationUpdate', 1);
            } else if(players[1] == undefined) {
                players[1] = usersId[id];
                socket.emit('situationUpdate', 2);
            }

            console.log(players);
            console.log(usersId);
            io.emit('userChange', [usersId, players]);
        }
    })

    socket.on('userUnParticipate', (id) => {
        players[players.indexOf(usersId[id])] = undefined;
        socket.emit('situationUpdate', 0);
        console.log(players);
        console.log(usersId);
        io.emit('userChange', [usersId, players]);
    })

    socket.on('giveBoard', () => {
        io.emit('giveBoard', board);
    })

    socket.on('putStone_1', (data) => {
        if(turn == 1) {
            board[data[0]][data[1]] = 1;
            io.emit('giveBoard', board);
            turn = 2;
            turnEnd();
        }
    })

    socket.on('putStone_2', (data) => {
        if(turn == 2) {
            board[data[0]][data[1]] = 2;
            io.emit('giveBoard', board);
            turn = 1;
            turnEnd();
        }
    })

    socket.on('disconnect', (reason) => {
        console.log(reason);
        let id = socket.id;
        console.log(`${socket.id} disconnected`);

        if(players.indexOf(usersId[id]) == 0) {
            players[0] = undefined;
        }
        if(players.indexOf(usersId[id]) == 1) {
            players[1] = undefined;
        }
        delete usersId[id];

        console.log(players);
        console.log(usersId);
        io.emit('userChange', [usersId, players]);
    })

    socket.on('chatting', (data) => {
        chatting.push(`${data[0]} : ${data[1]}`);
        io.emit('sendChatting', data);
    })
})



server.listen(PORT, () => {
    console.log(`server is running ${PORT}`);
})

function existCheck(data) {
    console.log(players);
    console.log(usersId);
    if(Object.values(usersId).includes(data) == true) {
        console.log('true');
        return 1;
    } else {
        console.log('false');
        return 0;
    }
}

function turnEnd() {
    for(let i = 0; i < 19; i++) {
        for(let j = 4; j < 23; j++) {
            if(
                board[i][j] == board[i+1][j] && board[i][j] == board[i+2][j] && board[i][j] == board[i+3][j] && board[i][j] == board[i+4][j] ||
                board[i][j] == board[i][j+1] && board[i][j] == board[i][j+2] && board[i][j] == board[i][j+3] && board[i][j] == board[i][j+4] ||
                board[i][j] == board[i+1][j+1] && board[i][j] == board[i+2][j+2] && board[i][j] == board[i+3][j+3] && board[i][j] == board[i+4][j+4] ||
                board[i][j] == board[i+1][j-1] && board[i][j] == board[i+2][j-2] && board[i][j] == board[i+3][j-3] && board[i][j] == board[i+4][j-4]
            ) {
                if(board[i][j] == 1 || board[i][j] == 2) {
                    console.log(`${board[i][j]} is win`);
                    console.log(players);
                    console.log(usersId);
                    io.emit('gameEnd', players[board[i][j] - 1]);
                    board = [
                        [3,3,3,3,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,3,3,3,3],
                        [3,3,3,3,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,3,3,3,3],
                        [3,3,3,3,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,3,3,3,3],
                        [3,3,3,3,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,3,3,3,3],
                        [3,3,3,3,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,3,3,3,3],
                        [3,3,3,3,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,3,3,3,3],
                        [3,3,3,3,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,3,3,3,3],
                        [3,3,3,3,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,3,3,3,3],
                        [3,3,3,3,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,3,3,3,3],
                        [3,3,3,3,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,3,3,3,3],
                        [3,3,3,3,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,3,3,3,3],
                        [3,3,3,3,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,3,3,3,3],
                        [3,3,3,3,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,3,3,3,3],
                        [3,3,3,3,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,3,3,3,3],
                        [3,3,3,3,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,3,3,3,3],
                        [3,3,3,3,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,3,3,3,3],
                        [3,3,3,3,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,3,3,3,3],
                        [3,3,3,3,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,3,3,3,3],
                        [3,3,3,3,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,3,3,3,3],
                        [3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3],
                        [3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3],
                        [3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3],
                        [3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3],
                    ];
                    turn = 1;
                    io.emit('giveBoard', board);
                    players = [undefined, undefined];
                    io.emit('situationUpdate', 0);
                    io.emit('userChange', [usersId, players]);
                    
                }
            }
        }
    }
}
