"use strict"

const socket = io();

var situation;
var board;
var Myid;
var username;
var playerNum;

socket.emit('userConnect', 0);

socket.on('sendId', (data) => {
    Myid = data;
    console.log(Myid);
})

socket.on('selectNickname', (id) => {
    if(id == Myid) {
        username = prompt('nickname?');
        console.log(username);
        document.getElementById('situation').innerHTML = `Hello ${username}`

        socket.emit('sendNickname', [Myid, username]);
    }
})

socket.on('giveBoard', (data) => {
    board = data;
    document.getElementById('board').innerHTML = '';
    for(var i = 0; i < 19; i++) {
        let column = document.createElement('div');
        column.className = `column ${i}`;
        document.getElementById('board').appendChild(column);
        for(var j = 4; j < 23; j++) {
            let row = document.createElement('img');
            if(data[i][j] == 4) {
                row.src = './image/alt_0.png';
            } else if(data[i][j] == 1) {
                row.src = './image/alt_1.png';
            } else if(data[i][j] == 2) {
                row.src = './image/alt_2.png';
            }
            row.className = `stone ${i} ${j}`;
            row.setAttribute("onClick", "clickEmptySpace(this)")
            
            column.appendChild(row);
        }
    }
})

socket.on('situationUpdate', (data) => {
    if(data == 0) {
        situation = 'observer';
        document.getElementById('situation').innerHTML = `Hello ${username} | observer`;
    } else if(data == 1) {
        situation = 1;
        document.getElementById('situation').innerHTML = `Hello ${username} | player 1`;
    } else if(data == 2) {
        situation = 2;
        document.getElementById('situation').innerHTML = `Hello ${username} | player 2`;
    }
})

socket.on('gameEnd', (data) => {
    alert(`${data} is win`);
})

socket.on('userChange', (data) => {
    if(data[1][0] != undefined) {
        document.getElementById('1p').innerHTML = data[1][0];
    } else {
        document.getElementById('1p').innerHTML = '';
    }
    if(data[1][1] != undefined) {
        document.getElementById('2p').innerHTML = data[1][1];
    } else {
        document.getElementById('2p').innerHTML = '';
    }

    let li;
    let userList = Object.values(data[0]);
    document.getElementById('observers').innerHTML = '';
    for(let i = 0; i < userList.length; i++) {
        if(data[1].includes(userList[i]) == false) {
            li = document.createElement('li');
            li.innerHTML = userList[i];
            document.getElementById('observers').appendChild(li);
        }
    }
})

socket.on('sendChatting', (data) => {
    let li = document.createElement('li');
    li.innerHTML = `${data[0]} : ${data[1]}`;
    document.getElementById('chatList').appendChild(li);
})

function parti() {
    socket.emit('userParticipate', Myid);
}

function unParti() {
    socket.emit('userUnParticipate', Myid);
}

function clickEmptySpace(obj) {
    console.log(obj.className);
    var arr = obj.className.split(' ');

    var sendData = new Array();
    sendData.push(arr[1]);
    sendData.push(arr[2]);
    if(board[arr[1]][arr[2]] != 4) {
        alert('이미 돌이 놓여 있음');
    } else {
        if(situation == 'observer') {
            alert('403 fobidden');
        } else if(situation == 1) {
            socket.emit('putStone_1', sendData);
        } else if(situation == 2) {
            socket.emit('putStone_2', sendData);
        }
    }
    
}

function chatting() {
    let data = document.getElementById('input').value;
    socket.emit('chatting', [username, data])
    document.getElementById('input').value = '';
}
