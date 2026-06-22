from fastapi import FastAPI,HTTPException,WebSocket,WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import random,string
from pydantic import BaseModel
import json

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:5500"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class joinRoomRequest(BaseModel):
    room_code: str

rooms = {}

def generateroomcode():
    chars = string.ascii_uppercase + string.digits
    code = "".join(random.choices(chars,k=6))

    return code

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
        "connections": []
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

@app.websocket("/ws/{room_code}")
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
        
            rooms[room_code]["players"].append(
                { "username" : data["username"], "host" : data["host"] }
            )
    
            for connection in rooms[room_code]["connections"]:
                await connection.send_text(
                    json.dumps(rooms[room_code]["players"])
                )
        
            print(rooms)
    except WebSocketDisconnect:

        if room_code not in rooms:
            return
    
        index = rooms[room_code]["connections"].index(websocket)
        
        if(index==0):
            print("Host Disconnected")

            await rooms[room_code]["connections"][1].send_text(
                json.dumps({"type": "Room Closed"})
            )

            del rooms[room_code]
            print(rooms)
        else:
            rooms[room_code]["connections"].pop(index)
            rooms[room_code]["players"].pop(index)

            for connection in rooms[room_code]["connections"]:
                await connection.send_text(
                    json.dumps(rooms[room_code]["players"])
                )

            print(rooms)