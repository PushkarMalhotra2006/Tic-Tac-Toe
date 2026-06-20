from fastapi import FastAPI
import random,string

app = FastAPI()

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

    return {"Room Code":room_code}