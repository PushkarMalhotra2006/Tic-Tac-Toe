from fastapi import FastAPI,HTTPException,WebSocket,WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import random,string
from pydantic import BaseModel
import json

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://tic-tac-toe-multiplayer-ultra.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class joinRoomRequest(BaseModel):
    room_code: str

rooms = {}

winning_patterns = [
    [0,1,2],
    [3,4,5],
    [6,7,8],

    [0,3,6],
    [1,4,7],
    [2,5,8],

    [0,4,8],
    [2,4,6]
]

def generateroomcode():
    chars = string.ascii_uppercase + string.digits
    code = "".join(random.choices(chars,k=6))

    return code

def checkwinner(board):
    for pattern in winning_patterns:
        first,second,third = pattern

        if(board[first]!="" and board[first]==board[second] and board[second]==board[third]):
            winnerfound = True
            return board[first]
    
    if "" not in board:
        return "Draw"
    
    return None

@app.get("/")
def home():
    return {"message":"server is running"}

@app.post("/create-room")
def create_room():
    room_code = generateroomcode()
    while room_code in rooms :
        room_code = generateroomcode()

    rooms[room_code] = {
        "players": [],
        "connections": [],
        "game_connections": {},
        "Game Started": False,

        "board": ["","","","","","","","",""],
        "turn": "X",
        "starting_player": "X",

        "game_active" : True,
        "rematch_votes" : [],

        "scores": {
            "X": 0,
            "O": 0,
            "draw": 0
        }
    }

    print(rooms)

    return {"Room_Code":room_code}

@app.post("/join-room")
def join_room(request: joinRoomRequest):
    if request.room_code not in rooms:
        raise HTTPException(status_code=404,detail="Room doesn't Exist")
    
    if len(rooms[request.room_code]["players"])==2:
        raise HTTPException(status_code=400,detail="ROom is Full")
    
    return {"success": True}

@app.websocket("/ws/lobby/{room_code}")
async def websocket_lobby(websocket: WebSocket, room_code: str):
  
    if room_code not in rooms:
       await websocket.close(0)
       return
    
    await websocket.accept()
    
    if len(rooms[room_code]["players"]) >= 2:
        await websocket.close()
        return
    

    rooms[room_code]["connections"].append(websocket)
    
    try:
        while True:
            data = await websocket.receive_text()
            data = json.loads(data)
            
            if data.get("type") == "Start Game":

                idx = rooms[room_code]["connections"].index(websocket)
                ishost = rooms[room_code]["players"][idx]["host"]

                if not ishost:
                    continue

                rooms[room_code]["Game Started"] = True

                for connection in rooms[room_code]["connections"]:
                    await connection.send_text(json.dumps({"type" : "Start Game"}))

            else:      
                rooms[room_code]["players"].append(
                    { "username" : data["username"], "host" : data["host"] }
                )
                
                if not rooms[room_code]["Game Started"]:
                    for connection in rooms[room_code]["connections"]:
                        await connection.send_text(
                            json.dumps(rooms[room_code]["players"])
                        )
            
                print(rooms)
    except WebSocketDisconnect:

        if room_code not in rooms:
            return
    
        index = rooms[room_code]["connections"].index(websocket)
        
        if(index==0 and not rooms[room_code]["Game Started"]):

            if len(rooms[room_code]["connections"]) >1:
                await rooms[room_code]["connections"][1].send_text(
                    json.dumps({"type": "Room Closed"})
                )

            del rooms[room_code]
            print(rooms)
        else:
            rooms[room_code]["connections"].pop(index)

            if not rooms[room_code]["Game Started"]:
                rooms[room_code]["players"].pop(index)

            for connection in rooms[room_code]["connections"]:
                await connection.send_text(
                    json.dumps(rooms[room_code]["players"])
                )

            print(rooms)

@app.websocket("/ws/game/{room_code}")
async def websocket_game(websocket: WebSocket, room_code: str):

    if room_code not in rooms:
        await websocket.close()
        return

    await websocket.accept()

    await websocket.send_text(
        json.dumps({
            "type": "player_info",
            "hostname": rooms[room_code]["players"][0]["username"],
            "guestname": rooms[room_code]["players"][1]["username"]
        })
    )

    try:
        while True:
            data = await websocket.receive_text()
            data = json.loads(data)

            if data.get("type") == "player_info":
                if data["host"]:
                    rooms[room_code]["game_connections"]["X"] = websocket
                else:
                    rooms[room_code]["game_connections"]["O"] = websocket

                continue

            if data.get("type") == "move":
                if not rooms[room_code]["game_active"]:
                    continue

                index = data["index"]

                if rooms[room_code]["board"][index] != "":
                    continue
                
                current_turn = rooms[room_code]["turn"]

                if current_turn == "X":
                    if websocket != rooms[room_code]["game_connections"].get("X"):
                        continue
                
                if current_turn == "O":
                    if websocket != rooms[room_code]["game_connections"].get("O"):
                        continue

                rooms[room_code]["board"][index] = current_turn

                winner = checkwinner(rooms[room_code]["board"])
                if winner is not None:
                    rooms[room_code]["game_active"] = False

                if winner == "X":
                    rooms[room_code]["scores"]["X"] += 1
                
                elif winner == "O":
                    rooms[room_code]["scores"]["O"] += 1
                
                elif winner == "Draw":
                    rooms[room_code]["scores"]["draw"] += 1

                if winner is None:
                    if current_turn=="X":
                        rooms[room_code]["turn"] = "O"
                    else:
                        rooms[room_code]["turn"] = "X"


                for connection in rooms[room_code]["game_connections"].values():
                    await connection.send_text(
                        json.dumps({
                            "type": "board_update",
                            "board": rooms[room_code]["board"],
                            "turn": rooms[room_code]["turn"],
                            "winner": winner,
                            "scores": rooms[room_code]["scores"],
                            "hostname": rooms[room_code]["players"][0]["username"],
                            "guestname": rooms[room_code]["players"][1]["username"]
                        })
                    )
            elif data.get("type") == "rematch":

                if websocket == rooms[room_code]["game_connections"].get("X"):
                    player = "X"
                else:
                    player = "O"
                
                if player not in rooms[room_code]["rematch_votes"]:
                    rooms[room_code]["rematch_votes"].append(player)

                if len(rooms[room_code]["rematch_votes"]) == 2:
                    rooms[room_code]["board"] = ["","","","","","","","",""]
                    rooms[room_code]["game_active"] = True
                    rooms[room_code]["rematch_votes"] = []

                    if rooms[room_code]["starting_player"] == "X":
                        rooms[room_code]["starting_player"] = "O"
                    else:
                        rooms[room_code]["starting_player"] = "X"

                    rooms[room_code]["turn"] = rooms[room_code]["starting_player"]

                    for connection in rooms[room_code]["game_connections"].values():
                        await connection.send_text(
                            json.dumps({
                                "type": "rematch",
                                "board": rooms[room_code]["board"],
                                "turn": rooms[room_code]["turn"],
                                "scores": rooms[room_code]["scores"],
                                "hostname": rooms[room_code]["players"][0]["username"],
                                "guestname": rooms[room_code]["players"][1]["username"]
                            })
                    )        


    except Exception as e:
        print("GAME DISCONNECT TRIGGERED", repr(e))
        if room_code not in rooms:
            return
        print("Before remove:", len(rooms[room_code]["game_connections"]))
        for player, connection in list(rooms[room_code]["game_connections"].items()):
            if connection == websocket:
                del rooms[room_code]["game_connections"][player]
                break

        print("After remove:", len(rooms[room_code]["game_connections"]))
        for connection in rooms[room_code]["game_connections"].values():

            print("Sending disconnect message")
            await connection.send_text(
                json.dumps({
                    "type": "player_disconnected"
                })
            )
        print("Deleting room")
        del rooms[room_code]