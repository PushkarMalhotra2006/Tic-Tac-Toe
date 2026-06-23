const backbutton = document.getElementById("button-back");

backbutton.addEventListener("click", () => {
    socket.close();
    window.location.href = "online.html";
});

const params = new URLSearchParams(window.location.search);

const roomCode = params.get("room");
const username = params.get("name");
const isHost = params.get("host") === "true";

const socket = new WebSocket(`wss://tic-tac-toe-backend-a6m1.onrender.com/ws/game/${roomCode}`);

socket.onopen = () => {
    console.log("Game Connected");

    socket.send(
        JSON.stringify({
            "type": "player_info",
            host: isHost
        })
    );
};

socket.onmessage = (event) => {

    const data = JSON.parse(event.data);

    if(data.type === "player_info"){

        if(data.hostname && data.guestname){
            turnTeller.textContent = `${data.hostname}'s Turn (X)`;
        }
    }

    if(data.type === "board_update"){

        board = data.board;

        cells.forEach((cell,index) => {
            cell.textContent = board[index];
        });

        if(data.turn === "X"){
            turnTeller.textContent =`${data.hostname}'s Turn (X)`;
        }
        else{
            turnTeller.textContent =`${data.guestname}'s Turn (O)`;
        }

        xScoreText.textContent = data.scores.X;
        oScoreText.textContent = data.scores.O;
        drawScoreText.textContent = data.scores.draw;

        if(data.winner){
            gameactive = false;

            if(data.winner === "Draw"){
                resultHeading.textContent = "It's a Draw!";
            }
            else{
                resultHeading.textContent = `${data.winner} Wins! 🎉`;
            }
            result.style.display ="flex";
            overlay.style.display = "flex";
        }
    }

    if(data.type === "rematch"){
        board = data.board;
        cells.forEach((cell,index) => {
            cell.textContent = board[index];
        })
        gameactive = true;

        result.style.display = "none";
        overlay.style.display = "none";

        if(data.turn === "X"){
            turnTeller.textContent =`${data.hostname}'s Turn (X)`;
        }
        else{
            turnTeller.textContent =`${data.guestname}'s Turn (O)`;
        }

        rematchBtn.style.display ="block";
        rematchBtn.disabled = false;
        rematchsync.textContent = "";
    }

    if(data.type === "player_disconnected"){
        console.log("DISCONNECT MESSAGE RECEIVED");
        gameactive = false;

        resultHeading.textContent = "Opponent Disconnected";
        rematchsync.textContent = "The match has ended.";
        rematchBtn.style.display = "none";
        homeBtn.textContent = "Back to Home";

        result.style.display = "flex";
        overlay.style.display = "flex";
    }
};

let gameactive = true;

const turnTeller = document.querySelector("#turn-teller p");
const cells = document.querySelectorAll(".cell");
const result = document.getElementById("result");
const resultHeading = document.querySelector("#result h2");
const rematchsync = document.getElementById("rematch-status");

cells.forEach((cell,index) => {
    cell.addEventListener("click", () => {

        if(!gameactive) return;

        if(cell.textContent !== ""){
            return;
        }

        socket.send(
            JSON.stringify({
            type: "move",
            index: index
            })
        );
    });
});

const rematchBtn = document.getElementById("rematch");
const homeBtn = document.getElementById("home");

homeBtn.addEventListener("click", () => {
    socket.close();
    window.location.href = "index.html";
});

rematchBtn.addEventListener("click", () => {

    socket.send(JSON.stringify({
        "type" : "rematch"
    }))

    rematchBtn.disabled = true;
    rematchsync.textContent = "Waiting for opponent to accept rematch"

});

const xScoreText = document.getElementById("x-score");
const drawScoreText = document.getElementById("draw-score");
const oScoreText = document.getElementById("o-score");
const overlay = document.getElementById("overlay");