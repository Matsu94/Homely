from typing import Optional
from pydantic import BaseModel, field_validator
from datetime import datetime

class User(BaseModel):
    User_ID: Optional[int] = None
    username: Optional[str] = None
    password: Optional[str] = None

# Modelo de token de acceso
class Token(BaseModel):
    access_token: str
    token_type: str
    user_id: int 
    group_id: Optional[int] = None
    
# Modelo de mensaje
class Message(BaseModel):
    Message_ID: Optional[int] = None
    Content: str
    Date: Optional[datetime] = None # Fecha de envío
    Sender: str # Foreign key, required
    Receiver: str # Foreign key, required

    @field_validator("Content")
    def validate_content(cls, value):
        if not value.strip():
            raise ValueError("Message content cannot be empty.")
        return value
    
    # Modelo de grupo
class Group(BaseModel):
    Group_ID: Optional[int] = None
    Name: str
    Description: Optional[str] = None
    Creator_ID: int 
    Address: Optional[str] = None
    Members: list[int] = []  # Lista de miembros del grupo

class Task(BaseModel):
    task_id: Optional[int] = None
    title: str
    description: Optional[str] = None
    type: str  # Tipo de tarea (recurrente o no recurrente)
    periodicity: Optional[str] = None  # Periodicidad de la tarea (diaria, semanal, mensual)
    date: Optional[datetime] = None  # Fecha de la tarea
    days: Optional[list[str]] = None  # Días específicos de la tarea
    
class TaskPayload(BaseModel):
    group_id: int
    tasks: list[Task]


    #Modelo para actualizar el nombre de un grupo
class NameUpdate(BaseModel):
    name: str

    #Modelo para actualizar la descripción de un grupo
class DescriptionUpdate(BaseModel):
    description: str
class NewMembers(BaseModel):
    Members: list[int] = []  # Lista de miembros del grupo
    