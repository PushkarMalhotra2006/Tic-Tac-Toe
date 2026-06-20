const backBtn = document.getElementById("button-back");
const createRoomBtn = document.getElementById("create-room-btn");
const joinRoomBtn = document.getElementById("join-room-btn");
const roomCodeInput = document.getElementById("room-code-input");
const errormsg = document.getElementById("error-msg");

backBtn.addEventListener("click", () => {
    window.location.href = "index.html";
});

const usernameBtn = document.getElementById("username-btn");
const usernamePanel = document.getElementById("username-panel");
const saveUsernameBtn = document.getElementById("save-username");
const usernameInput = document.getElementById("username-input");
const usernameError = document.getElementById("username-error");
const usernameDisplay = document.getElementById("username-display");
let username = "";

usernameBtn.addEventListener("click", () => {
    usernamePanel.classList.toggle("active");

    setTimeout(() => {
        usernameInput.focus();
    }, 200);
});

usernameInput.addEventListener("input", () => {
    usernameError.style.display = "none";
})

saveUsernameBtn.addEventListener("click", () => {
    let inputname = usernameInput.value.trim();

    if(inputname === ""){
        usernameError.style.display = "block";
        return;
    }

    username = inputname;
    usernameDisplay.textContent = username;

    usernameBtn.style.display = "none";
    usernameDisplay.style.display = "block";

    usernameInput.value = "";
    usernameError.textContent = "";
    usernameError.style.display = "none";
    usernamePanel.classList.remove("active");
})
usernameInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        saveUsernameBtn.click();
    }
});

usernameDisplay.addEventListener("click", () => {
    usernamePanel.classList.toggle("active");

    setTimeout(() => {
        usernameInput.focus();
    }, 200);
});

function generateroomcode(){
    let code = Math.random().toString(36).substring(2,8).toUpperCase();
    return code;
}

createRoomBtn.addEventListener("click", () => {

    if (username === "") {

        usernameBtn.classList.add("shake");
        usernameBtn.classList.add("flash-error");

        setTimeout(() => {
            usernameBtn.classList.remove("shake");
            usernameBtn.classList.remove("flash-error");
        }, 500);

        usernamePanel.classList.add("active");
        usernameInput.focus();
    
        return;
    }

    const roomCode = generateroomcode();

    window.location.href = `lobby.html?room=${roomCode}&host=true&name=${username}`;
});

roomCodeInput.addEventListener("input", () => {
    roomCodeInput.value = roomCodeInput.value.toUpperCase();

    errormsg.style.visibility = "hidden";
});

joinRoomBtn.addEventListener("click", () => {

    if (username === "") {

        usernameBtn.classList.add("shake");
        usernameBtn.classList.add("flash-error");

        setTimeout(() => {
            usernameBtn.classList.remove("shake");
            usernameBtn.classList.remove("flash-error");
        }, 500);

        usernamePanel.classList.add("active");
        usernameInput.focus();
    
        return;
    }


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

    window.location.href = `lobby.html?room=${inputcode}&host=false&name=${username}`;
})

roomCodeInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        joinRoomBtn.click();
    }
});