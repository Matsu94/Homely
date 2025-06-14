from fastapi import Body, FastAPI, Depends, HTTPException, status, WebSocket, WebSocketDisconnect, UploadFile, File, Form
from controllers.jwt_auth_users import *
from controllers.controllers import Matias
from models.models import *
from datetime import timedelta
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from typing import Dict, Set
import json
import secrets
import string
import os
from uuid import uuid4

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Aquí especifica los orígenes permitidos
    allow_credentials=True,
    allow_methods=["*"],  # Métodos permitidos (GET, POST, etc.)
    allow_headers=["*"],  # Headers permitidos
)

def get_db():
    db = Matias()
    try:
        db.conecta()
        yield db
    finally:
        db.desconecta()


# Add WebSocket manager to handle connections
class ConnectionManager:
    def __init__(self):
        self.active_connections = {}

    async def connect(self, websocket: WebSocket, user_id: str):
        await websocket.accept()
        if user_id not in self.active_connections:
            self.active_connections[user_id] = []
        self.active_connections[user_id].append(websocket)
        print(f"User {user_id} connected. Active connections: {self.active_connections}")

    def disconnect(self, websocket: WebSocket, user_id: str):
        if user_id in self.active_connections:
            self.active_connections[user_id].remove(websocket)
            if not self.active_connections[user_id]:
                del self.active_connections[user_id]
        print(f"User {user_id} disconnected. Active connections: {self.active_connections}")

    async def send_personal_message(self, message: dict, user_id: str):
        if user_id in self.active_connections:
            message_array = [message]  # Wrap the message in an array
            for connection in self.active_connections[user_id]:
                # await connection.send_text(message)
                await connection.send_text(json.dumps(message_array))  # Send as JSON array
            print(f"Message sent to user {user_id}: {message}")
        else:
            print(f"User {user_id} is not connected.")

manager = ConnectionManager()

# WebSocket endpoint
@app.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: str):
    await manager.connect(websocket, user_id)
    try:
        while True:
            data = await websocket.receive_text()
            # You can handle incoming messages here if needed
    except WebSocketDisconnect:
        manager.disconnect(websocket, user_id)


@app.get("/chats") # ESTE SERÍA EL PRIMER ENDPOINT DSPS DE LOGIN
def get_chats(db: Matias = Depends(get_db), user: str = Depends(get_current_user)):
    user_id = user['user_id']
    return db.getChats(user_id)
    
# Endpoint to send a message (1m)
@app.post("/sendMessage")
async def send_message(message: Message, db: Matias = Depends(get_db), user: str = Depends(get_current_user)):
    message_id = db.sendMessage(message)
    username = user['username']
    # Convert the message to a dictionary
    message_dict = {
        "message_id": message_id,
        "sender_name": username,
        "user_name": username,
        "content": message.Content,
        "date": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "status": message.Status,
        "sender_id": message.Sender,
        "receiver_id": message.Receiver,
    }
    
    room_id = f"Group_{message.Receiver}"  # Ensure group WebSockets are prefixed

    await manager.send_personal_message(message_dict, room_id)
    return {"message_id": message_id}

# Endpoint to check the number of messages the user has received and not read (3m)
@app.get("/check_messages") 
def check_messages(db: Matias = Depends(get_db), receiver: str = Depends(get_current_user)):
    receiver_id = receiver['user_id']
    return db.checkMessages(receiver_id)

# Endpoint to get all messages from a chat (2m) (3m)
@app.get("/receive_messages/{sender_id}")
def receive_messages(
    offset: int = 0,
    db: Matias = Depends(get_db),
    receiver: str = Depends(get_current_user)
):
    receiver_id = receiver['user_id']
    messages = db.getMessagesChat(offset=offset, receiver_id=receiver_id)
    return messages

# Endpoint to change the state of a message (3m)
@app.put("/change_state/{state_id}")
def change_state(
    state_id: int,  # ID del estado que se quiere cambiar
    messages: list[dict] = Body(...),  # Lista de IDs de mensajes recibida en el cuerpo de la solicitud
    db: Matias = Depends(get_db), 
    receiver: str = Depends(get_current_user)
):
    receiver_id = receiver['user_id']
    result = 0
    for message in messages:
        result += db.changeMessageState(message, state_id, receiver_id)
    return {"message": "Estado actualizado correctamente.", "result": result}

#==================GROUPS==================

# Endpoint to create a group (2g)
@app.post("/create_group")
def create_group(group: Group, db: Matias = Depends(get_db), user: str = Depends(get_current_user)):
    return db.createGroup(group)

@app.post("/add_tasks")
def add_tasks(payload: TaskPayload, db: Matias = Depends(get_db), user: str = Depends(get_current_user)):
    return db.addTasksToGroup(payload.group_id, payload.tasks)

@app.get("/get_tasks/{group_id}")
def get_tasks(group_id: int, db: Matias = Depends(get_db), user: str = Depends(get_current_user)):
    return db.getTasks(group_id)


@app.post("/upload_image")
async def upload_image(chore_id: int = Form(...), file: UploadFile = File(...), user: dict = Depends(get_current_user)):
    upload_dir = "uploaded_images"
    os.makedirs(upload_dir, exist_ok=True)
    
    ext = file.filename.split(".")[-1]
    filename = f"{uuid4().hex}_{user['user_id']}_{chore_id}.{ext}"
    file_path = os.path.join(upload_dir, filename)

    with open(file_path, "wb") as f:
        content = await file.read()
        f.write(content)

    image_url = f"/{file_path}"  # Update this if serving images through static route

    return {"image_url": image_url}

@app.post("/complete_task/{task_id}")
def complete_task(task_id: int, payload: dict, db: Matias = Depends(get_db), user: str = Depends(get_current_user)):
    img_url = payload.get("img_url")
    periodicity = payload.get("periodicity")
    user_id = user['user_id']
    return db.completeTask(task_id, user_id, img_url, periodicity)


@app.delete("/delete_task/${task_id}")
def delete_task(task_id: int, db: Matias = Depends(get_db), user: str = Depends(get_current_user)):
    return db.deleteTask(task_id)

@app.put("/update_task/{task_id}")
def update_task(task_id: int, task: Task, db: Matias = Depends(get_db), user: str = Depends(get_current_user)):
    return db.updateTask(task_id, task)



@app.get("/completions/{group_id}")
def get_completions(group_id: int, db: Matias = Depends(get_db), user: str = Depends(get_current_user)):
    return db.getCompletions(group_id)

# Endpoint to get members of a group
@app.get("/get_members/{group_id}")
def get_members(group_id: int, db: Matias = Depends(get_db), user: str = Depends(get_current_user)):
    return db.getMembers(group_id)

@app.get("/group_info/{group_id}")
def group_info(group_id: int, db: Matias = Depends(get_db), user: str = Depends(get_current_user)):
    return db.groupinfo(group_id)

@app.get("/create_group_invitation/{group_id}")
def create_group_invitation(group_id: int, length = 10, db: Matias = Depends(get_db), user: str = Depends(get_current_user)):
    chars = string.ascii_uppercase + string.digits  # A-Z, 0-9
    invitation_code = ''.join(secrets.choice(chars) for _ in range(length))
    print(f"Generated invitation code: {invitation_code} for group ID: {group_id}")
    db.saveInvitationCode(group_id, invitation_code)
    return invitation_code

# Endpoint to add a user to a group (3g)
# @app.put("/add_users/{group_id}")
# def add_users_to_group(group_id: int, newMembers: NewMembers, db: Matias = Depends(get_db), admin: str = Depends(get_current_user)):
#     res = 0
#     for member_id in newMembers.Members:
#         res += db.addUsersToGroup(group_id, member_id)
#     return {"message": "Usuarios añadidos correctamente.", "result": res}

# Endpoint to delete a user from a group (3g)
@app.delete("/remove_user/{group_id}/{member_id}")
def delete_user_from_group(group_id: int, member_id: int, db: Matias = Depends(get_db), admin: str = Depends(get_current_user)):
    admin_id = admin['user_id']
    return db.deleteUserFromGroup(group_id, member_id, admin_id)

# Endpoint to change group admin (3g)
@app.put("/add_admin/{group_id}/{member_id}")
def add_admin(group_id: int, member_id: int, db: Matias = Depends(get_db), admin: str = Depends(get_current_user)):
    admin_id = admin['user_id']
    return db.addAdmin(group_id, member_id, admin_id)

# Endpoint to change group name (4g)
@app.put("/update_name/{group_id}")
def update_name(group_id: int, name: NameUpdate, db: Matias = Depends(get_db), admin: str = Depends(get_current_user)):
    return db.updateName(group_id, name)

# Endpoint to change group description
@app.put("/update_description/{group_id}")  
def update_description(group_id: int, description: DescriptionUpdate, db: Matias = Depends(get_db)):
    return db.updateDescription(group_id, description)

# Endpoint to leave a group (5g)
@app.delete("/leave_group/{group_id}")
def leave_group(group_id: int, db: Matias = Depends(get_db), admin: str = Depends(get_current_user)):
    admin_id = admin['user_id']
    result = db.leaveGroup(group_id, admin_id)

    if result is None:
        raise HTTPException(status_code=400, detail="You're the only admin left, promote another user before leaving.")
    
    return {"message": "Left group successfully"}


# Endpoint to get message status of group messages
@app.get("/group_message_status/{message_id}")
def group_message_status(message_id: int, db: Matias = Depends(get_db), receiver: str = Depends(get_current_user)):
    return db.groupMessageStatus(message_id)

# Endpoint to generate a token
@app.post("/token", response_model=Token)
async def login(user: User, db: Matias = Depends(get_db)):
    authenticated_user = authenticate_user(db, user.username, user.password)
    if not authenticated_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"username": authenticated_user["username"], "user_id": authenticated_user["user_id"], "group_id": authenticated_user["group_id"]}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer", "user_id": authenticated_user["user_id"], "group_id": authenticated_user["group_id"]}

# Endpoint to register a new user
@app.post("/register")
def register_user(user: User, db: Matias = Depends(get_db)):
    user_id = db.registerUser(user)
    return {"message": "User registered successfully", "user_id": user_id}

@app.post("/join_group")
def join_group(request: GroupJoinRequest, db: Matias = Depends(get_db), user: str = Depends(get_current_user)):
    group_code = request.group_code
    user_id = user['user_id']
    group_dic = db.checkInvitationCode(group_code)
    group_id = group_dic.get("group_id") if group_dic else None
    if group_id is None:
        raise HTTPException(status_code=400, detail="Invalid group code")
    db.joinGroup(group_id, user_id)
    db.deleteInvitation(group_code, group_id)
    return group_id