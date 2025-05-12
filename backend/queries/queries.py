
lastMessageGroup = """
SELECT m.*
FROM messages m
INNER JOIN groups g ON m.receiver_id = g.group_id
INNER JOIN group_members gm ON gm.group_id = m.receiver_id
WHERE gm.user_id = %s
ORDER BY m.date DESC
LIMIT 1;
"""

checkUser = "SELECT * FROM users WHERE username = %s"

sendMessage = """
INSERT INTO messages (content, date, sender_id, receiver_id)
VALUES (%s, %s, %s, %s)
"""  

selectGroupMember =  """
SELECT user_id 
FROM group_members 
WHERE group_id = %s
"""

changeStatusGroupMessage = """
INSERT INTO group_message_status (message_id, user_id, status)
VALUES (%s, %s, %s)
"""

checkMessagesGroups = """
SELECT m.*
FROM messages m
INNER JOIN groups g ON m.receiver_id = g.group_id
INNER JOIN group_members gm ON gm.group_id = m.receiver_id
INNER JOIN group_message_status gms ON m.message_id = gms.message_id
WHERE gm.user_id = %s
AND gms.status != 3
ORDER BY m.date DESC;
"""

checkMessageWithId = """
SELECT * from messages
WHERE message_id = %s
AND sender_id != %s
"""

updateMEssageGroupStatus = """
UPDATE group_message_status
SET status = %s
WHERE message_id = %s
AND user_id = %s
"""

getMessagesChatGroup = """
SELECT m.*
FROM messages m
INNER JOIN groups g ON m.receiver_id = g.group_id
INNER JOIN group_members gm ON gm.group_id = m.receiver_id
WHERE gm.user_id = %s
ORDER BY m.date DESC
LIMIT 10
OFFSET %s
"""

groupMessageStatus = """
SELECT status, username
FROM group_message_status
INNER JOIN users USING (user_id)
WHERE message_id = %s
"""

messageStatus = """
SELECT status
FROM messages
WHERE message_id = %s
"""

createGroup = """
INSERT INTO groups (name, description, creator_id)
VALUES (%s, %s, %s)
"""

insertGroupAdmin = """
INSERT INTO group_members (group_id, user_id, is_admin)
VALUES (%s, %s, 1) 
"""

insertGroupMemnber = """
INSERT INTO group_members (group_id, user_id, is_admin)
VALUES (%s, %s, 0)
"""

esAdmin = """
SELECT is_admin
FROM group_members
WHERE group_id = %s
AND user_id = %s
"""

getMembers = """
SELECT u.user_id, u.username, gm.is_admin
FROM group_members gm
INNER JOIN users u ON gm.user_id = u.user_id
WHERE gm.group_id = %s
"""

groupInfo = """
SELECT *
FROM groups
WHERE group_id = %s
"""

insertGroupMembers = """
INSERT INTO group_members (group_id, user_id)
VALUES (%s, %s)
"""

deleteGroupMember = """
DELETE FROM group_members
WHERE group_id = %s
AND user_id = %s
"""

addAdmin = """
UPDATE group_members 
SET is_admin = TRUE 
WHERE group_id = %s 
AND user_id = %s
"""

checkOtherGroupAdmin = """
SELECT is_admin
FROM group_members
WHERE group_id = %s
AND user_id != %s
AND is_admin = TRUE
"""            

checkOtherGroupMembers = """
SELECT user_id
FROM group_members
WHERE group_id = %s
AND user_id != %s
"""

leaveGroup = """
DELETE FROM group_members
WHERE group_id = %s
AND user_id = %s
"""

deleteGroupStatuses = """
DELETE FROM group_message_status
WHERE message_id IN (SELECT message_id FROM messages WHERE receiver_id = %s)
"""

deleteGroupMessages = """
DELETE FROM messages
WHERE receiver_id = %s
"""

deleteGroup = """
DELETE FROM groups
WHERE group_id = %s
"""

updateGroupName = """
UPDATE groups
SET name = %s
WHERE group_id = %s
"""

updateGroupDescription = """
UPDATE groups
SET description = %s
WHERE group_id = %s
"""

registerUser = """
INSERT INTO users (username, password)
VALUES (%s, %s)
"""