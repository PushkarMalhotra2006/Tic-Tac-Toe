const backbutton = document.getElementById("button-back");

backbutton.addEventListener("click", () => {
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

const P1_name = document.getElementById("p1-name");

if(isHost){
    P1_name.textContent = `${username} (X)`;
}

copyBtn.addEventListener("click", () => {
    navigator.clipboard.writeText(roomCodeDisplay.textContent);

    tooltip.textContent = "Copied!";

    setTimeout(() => {
        tooltip.textContent = "Copy Code";
    }, 2000);
});

if (isHost) {
    startBtn.disabled = false;
}
