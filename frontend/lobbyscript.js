const backbutton = document.getElementById("button-back");

backbutton.addEventListener("click", () => {
    window.location.href = "online.html";
});

const roomCodeDisplay = document.getElementById("room-code");
const copyBtn = document.getElementById("copy-code-btn");
const tooltip = document.getElementById("tooltip");

const params = new URLSearchParams(window.location.search);
const roomCode = params.get("room");

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