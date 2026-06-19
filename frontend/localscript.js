const backbutton = document.getElementById("button-back");

backbutton.addEventListener("click", () => {
    window.location.href = "index.html";
});


let board = ["", "", "", "", "", "", "", "", ""];
const winningPatterns = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],

    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],

    [0, 4, 8],
    [2, 4, 6]
];

const firstplayer = "X";
const secondplayer = "O";
let startingplayer = firstplayer;
let currentplayer = startingplayer;

let gameactive = true;

const turnTeller = document.querySelector("#turn-teller p");
const cells = document.querySelectorAll(".cell");
const result = document.getElementById("result");
const resultHeading = document.querySelector("#result h2");

function checkwinner(){
    let winnerfound = false;

    winningPatterns.forEach((pattern) => {
        const first = pattern[0];
        const second = pattern[1];
        const third = pattern[2];

        if(board[first]!== "" && board[first]===board[second] && board[second]===board[third]){
            resultHeading.textContent = `${board[first]} Won 🎉`;
            result.style.display ="flex";
            gameactive=false;
            winnerfound=true;

            if(board[first]===firstplayer){
                xScore++;
                xScoreText.textContent = xScore;
            }
            else{
                oScore++;
                oScoreText.textContent = oScore;
            }
        }
    });
    if(!winnerfound && !board.includes("")){
        resultHeading.textContent = "It's a Draw !";
        result.style.display = "flex";
        gameactive=false;
        drawScore++;
        drawScoreText.textContent = drawScore;
    }
}

cells.forEach((cell,index) => {
    cell.addEventListener("click", () => {

        if(!gameactive) return;

        if(cell.textContent !== ""){
            return;
        }

        cell.textContent = currentplayer;
        board[index] = currentplayer;
        checkwinner();
        if(!gameactive) return;

        if(currentplayer === firstplayer){
            currentplayer=secondplayer;
        }
        else{
            currentplayer=firstplayer;
        }
        turnTeller.textContent = `Player ${currentplayer}'s Turn`
    });
});

const rematchBtn = document.getElementById("rematch");
const homeBtn = document.getElementById("home");

homeBtn.addEventListener("click", () => {
    window.location.href = "index.html";
});

rematchBtn.addEventListener("click", () => {
    result.style.display = "none";

    cells.forEach((cell) => {
        cell.textContent = "";
    });

    gameactive=true;
    board = ["", "", "", "", "", "", "", "", ""];
    
    if (startingplayer === firstplayer) {
        startingplayer = secondplayer;
    }
    else {
        startingplayer = firstplayer;
    }

    currentplayer = startingplayer;

    turnTeller.textContent = `Player ${currentplayer}'s Turn`;
});

const xScoreText = document.getElementById("x-score");
const drawScoreText = document.getElementById("draw-score");
const oScoreText = document.getElementById("o-score");

let xScore = 0;
let drawScore = 0;
let oScore = 0;