const backbutton = document.getElementById("button-back");

backbutton.addEventListener("click", () => {
    socket.close();
    window.location.href = "online.html";
});

const roomCodeDisplay = document.getElementById("room-code");
const copyBtn = document.getElementById("copy-code-btn");
const tooltip = document.getElementById("tooltip");
const startBtn = document.getElementById("start-btn");

const params = new URLSearchParams(window.location.search);
const roomCode = params.get("room");
const isHost = params.get("host") === "true";
const username = params.get("name");

if (roomCode) {
    roomCodeDisplay.textContent = roomCode;
}

copyBtn.addEventListener("click", () => {
    navigator.clipboard.writeText(roomCodeDisplay.textContent);

    tooltip.textContent = "Copied!";

    setTimeout(() => {
        tooltip.textContent = "Copy Code";
    }, 2000);
});

const P1 = document.getElementById("p1-name");
const P2 = document.getElementById("p2-name");
const socket = new WebSocket(`wss://tic-tac-toe-backend-a6m1.onrender.com/ws/lobby/${roomCode}`);

socket.onopen = () => {
    socket.send(
        JSON.stringify({
            username: username,
            host: isHost
        })
    );
};

socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    
    if(data.type === "Start Game"){
        window.location.href = `onlinegame.html?room=${roomCode}&host=${isHost}&name=${username}`
    }

    if (data.type === "Room Closed") {
        alert("Host disconnected");
        window.location.href = "online.html";
        return;
    }

    const players = data;
    P1.textContent = players[0].username + " (X)";

    if(players.length > 1){
        P2.textContent = players[1].username + " (O)";
    }
    else{
        P2.textContent = "Waiting for Opponent...";
    }
    
    if (isHost) {
        startBtn.disabled = players.length !== 2;
    }
}

startBtn.addEventListener("click", () => {
    socket.send(JSON.stringify({
        type:"Start Game"
    }));
})