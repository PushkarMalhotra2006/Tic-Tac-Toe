const backBtn = document.getElementById("button-back");
const createRoomBtn = document.getElementById("create-room-btn");
const joinRoomBtn = document.getElementById("join-room-btn");
const roomCodeInput = document.getElementById("room-code-input");
const errormsg = document.getElementById("error-msg");

backBtn.addEventListener("click", () => {
    window.location.href = "index.html";
});

function generateroomcode(){
    let code = Math.random().toString(36).substring(2,8).toUpperCase();
    return code;
}

createRoomBtn.addEventListener("click", () => {
    const roomCode = generateroomcode();

    window.location.href = `lobby.html?room=${roomCode}`;
});

roomCodeInput.addEventListener("input", () => {
    roomCodeInput.value = roomCodeInput.value.toUpperCase();

    errormsg.style.visibility = "hidden";
});

joinRoomBtn.addEventListener("click", () => {
    const inputcode = roomCodeInput.value;

    if(inputcode === ""){
        errormsg.textContent = "Please Enter a rooom code";
        errormsg.style.visibility = "visible";
        return;
    }
    if(inputcode.length !== 6){
        errormsg.textContent = "Room Code must be 6 characters";
        errormsg.style.visibility = "visible";
        return;
    }

    window.location.href = `lobby.html?room=${inputcode}`;
})