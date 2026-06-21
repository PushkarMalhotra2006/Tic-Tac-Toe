from fastapi import FastAPI,HTTPException
from fastapi.middleware.cors import CORSMiddleware
import random,string
from pydantic import BaseModel

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

    rooms[room_code] = {}
    print(rooms)

    return {"Room_Code":room_code}

@app.post("/join-room")
def join_room(request: joinRoomRequest):
    if request.room_code not in rooms:
        raise HTTPException(status_code=404,detail="Room doesn't Exist")
    
    return {"success": True}