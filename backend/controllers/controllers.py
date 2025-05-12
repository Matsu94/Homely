from datetime import datetime
import calendar
import pymysql.cursors
from queries.queries import *
from werkzeug.security import generate_password_hash

class Matias(object):
    def conecta(self):
        self.db = pymysql.connect(
            host="localhost",
            #host="192.168.193.133",
            #port=3306,
            user="root",
            #user="matiasianbastero",
            #password="49864854A",
            db="homely",
            #db="damahe",
            charset="utf8mb4",
            autocommit=True,
            cursorclass=pymysql.cursors.DictCursor
        )
        self.cursor = self.db.cursor()

    def desconecta(self):
        self.db.close()
    
    
    def getChats(self, user_id):

        # Fetch group messages
        sql_group = lastMessageGroup
        self.cursor.execute(sql_group, (user_id,))
        group_messages = self.cursor.fetchall()

        if not group_messages:
            group_messages = []
            
        return group_messages
    
    
    
    def checkUser(self, username):
        sql = checkUser
        self.cursor.execute(sql, (username,))
        return self.cursor.fetchone()
    

    # Query to send a message (1m)
    # Se asume que 'message' es un objeto que contiene:
    # message.Content, message.Date (opcional), message.Status, message.Sender, message.Receiver, message.IsGroup
    def sendMessage(self, message):
        sql = sendMessage
        # Omitimos el RETURNING message_id porque MySQL/MariaDB no lo soporta.
    
        self.cursor.execute(sql, (
            message.Content,
            message.Date,         
            message.Sender,       
            message.Receiver
        ))
    
        # Tomar el id autoincrement recién insertado
        last_id = self.cursor.lastrowid

        sql = selectGroupMember
        self.cursor.execute(sql, (message.Receiver,))
        res2 = self.cursor.fetchall()
        for user in res2:
            if user['user_id'] == message.Sender:
                sql = changeStatusGroupMessage
                self.cursor.execute(sql, (last_id, user['user_id'], 3))
            else:
                sql = changeStatusGroupMessage
                self.cursor.execute(sql, (last_id, user['user_id'], 1))
    
        # Devuelve el último ID insertado
        return last_id

    # Query to check the number of unread (o sin leer) messages para un usuario (3m)
    # Se asume status = 1 (enviado) como "pendiente de leer"
    def checkMessages(self, receiver_id):
        sql = checkMessagesGroups
        self.cursor.execute(sql, (receiver_id,))
        result = self.cursor.fetchall()
        if not result:
            result = []
        return result

    # Query to change the state (status) of a message (3m)
    def changeMessageState(self, message, new_status, receiver_id):
        sql = updateMEssageGroupStatus
        self.cursor.execute(sql, (new_status, message['message_id'], receiver_id))
        return self.cursor.rowcount  # Return the total number of rows updated

    # Query to get all messages (o mensajes de un remitente a un destinatario) (2m)
    def getMessagesChat(self, offset, receiver_id):
        sql = getMessagesChatGroup
        self.cursor.execute(sql, (receiver_id, offset))
        return self.cursor.fetchall()
    
    def groupMessageStatus(self, message_id):
        sql = groupMessageStatus
        self.cursor.execute(sql, (message_id))
        return self.cursor.fetchall()
    
    # ------------------------------------------------
    #   Operaciones sobre Grupos
    # ------------------------------------------------
    

    # Query to create a group (2g)
    def createGroup(self, group):
        sql = createGroup
        self.cursor.execute(sql, (group.Name, group.Description, group.Creator_ID, group.Address))
        group_id = self.cursor.lastrowid
        sql = insertGroupAdmin
        self.cursor.execute(sql, (group_id, group.Creator_ID))
        return group_id
    
    def addTasksToGroup(self, group_id, tasks):
        for task in tasks:
            sql = addTaskToGroup
            days_str = ", ".join(task.days) if task.days else None
            now = datetime.now()
            # Set default fecha_límite if missing
            if task.periodicity == "Mensual" and task.date is None:
                task.date = datetime(now.year, now.month, calendar.monthrange(now.year, now.month)[1])
            elif task.periodicity == "Anual" and task.date is None:
                task.date = datetime(now.year, 12, 31)
            self.cursor.execute(sql, (
                group_id,
                task.title,
                task.description,
                task.type,
                task.periodicity,
                days_str,
                task.date
            ))
        return self.cursor.lastrowid
    
    def getMembers(self, group_id):
        sql = getMembers
        self.cursor.execute(sql, (group_id,))
        return self.cursor.fetchall()
    
    def groupinfo(self, group_id):
        sql = groupInfo
        self.cursor.execute(sql, (group_id,))
        return self.cursor.fetchone()
    
    # Query to add a user to a group (3g)
    # def addUsersToGroup(self, group_id, member_id): 
    #             sql = insertGroupMembers
    #             self.cursor.execute(sql, (group_id, member_id))
    #             return self.cursor.rowcount

    # Query to save invitation code
    def saveInvitationCode(self, group_id, invitation_code):
        sql = saveInvitationCode
        self.cursor.execute(sql, (group_id, invitation_code))
        return self.cursor.lastrowid

    # Query to delete a user from a group (3g)
    def deleteUserFromGroup(self, group_id, member_id, admin_id):
                sql = deleteGroupMember
                self.cursor.execute(sql, (group_id, member_id))
                return self.cursor.rowcount

    # Query to change group admin (3g)
    def addAdmin(self, group_id, member_id, admin_id):
            sql = addAdmin
            self.cursor.execute(sql, (group_id, member_id))
            return self.cursor.rowcount

    # Query to change group name (4g)
    def updateName(self, group_id, new_name):
            sql = updateGroupName
            self.cursor.execute(sql, (new_name.name, group_id))
            return self.cursor.rowcount

    # Query to change group description
    def updateDescription(self, group_id, new_description): 
        sql = updateGroupDescription
        self.cursor.execute(sql, (new_description.description, group_id))
        return self.cursor.rowcount
    
    # Query to leave a group (5g)
    def leaveGroup(self, group_id, admin_id):
        sql = esAdmin
        self.cursor.execute(sql, (group_id, admin_id))
        result = self.cursor.fetchone()
        print(result, admin_id)

        if result and result['is_admin'] == False:
            sql = leaveGroup
            self.cursor.execute(sql, (group_id, admin_id))
            return self.cursor.rowcount
        else:
            # Check if there are other admins
            sql = checkOtherGroupAdmin 
            self.cursor.execute(sql, (group_id, admin_id))
            other_admins = len(self.cursor.fetchall())  

            # Check if there are other users
            sql = checkOtherGroupMembers 
            self.cursor.execute(sql, (group_id, admin_id))
            other_users = len(self.cursor.fetchall())
            print(other_admins, other_users)
            if other_users == 0:
                # If no other users, delete the group
                sql = leaveGroup
                self.cursor.execute(sql, (group_id, admin_id))
                sql = deleteGroupStatuses
                self.cursor.execute(sql, (group_id,))
                sql = deleteGroupMessages
                self.cursor.execute(sql, (group_id,))
                sql = deleteGroup
                self.cursor.execute(sql, (group_id,))
                return self.cursor.lastrowid  
            elif other_admins == 0 and other_users > 0:
                return
            else:
                sql = leaveGroup
                self.cursor.execute(sql, (group_id, admin_id))


    def registerUser(self, user):
        sql = registerUser
        print(user.username, user.password)
        # Hash the password before storing it
        hashed_password = generate_password_hash(user.password, method='scrypt:32768:8:1', salt_length=8)
        self.cursor.execute(sql, (user.username, hashed_password))
        return self.cursor.lastrowid
    
    def checkInvitationCode(self, code):
        sql = checkInvitationCode
        self.cursor.execute(sql, (code,))
        return self.cursor.fetchone()
    
    def joinGroup(self, group_id, user_id):
        sql = joinGroup
        self.cursor.execute(sql, (group_id, user_id))
        return self.cursor.rowcount
    
    def deleteInvitation(self, code, group_id):
        sql = deleteInvitation
        self.cursor.execute(sql, (code, group_id))
        return self.cursor.rowcount