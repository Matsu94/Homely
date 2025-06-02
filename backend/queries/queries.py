
lastMessageGroup = """
SELECT m.*
FROM messages m
INNER JOIN groups g ON m.receiver_id = g.group_id
INNER JOIN group_members gm ON gm.group_id = m.receiver_id
WHERE gm.user_id = %s
ORDER BY m.date DESC
LIMIT 1;
"""

checkUser = """
SELECT u.*, gm.group_id
FROM users u
LEFT JOIN group_members gm ON u.user_id = gm.user_id
WHERE u.username = %s
"""

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
INSERT INTO groups (name, description, creator_id, address)
VALUES (%s, %s, %s, %s)
"""

addTaskToGroup = """
INSERT INTO chores (group_id, title, description, type, periodicity, specific_days, date_limit)
VALUES (%s, %s, %s, %s, %s, %s, %s)
"""

getTasks = """
SELECT 
    c.*,
    GROUP_CONCAT(DATE(cc.completed_at)) AS completion_dates,
    GROUP_CONCAT(cc.repeating) AS completion_repeats
FROM chores c
LEFT JOIN chore_completions cc ON c.chore_id = cc.chore_id 
    AND cc.completed_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
WHERE c.group_id = %s
    AND (c.date_limit >= CURDATE() OR c.date_limit IS NULL)
GROUP BY c.chore_id
"""


deleteTask = """
DELETE FROM chores
WHERE chore_id = %s
"""

updateTask = """
UPDATE chores
SET title = %s,
    description = %s,
    type = %s,
    periodicity = %s,
    specific_days = %s,
    date_limit = %s
WHERE chore_id = %s
"""

completeTask = """
INSERT INTO chore_completions (chore_id, user_id, proof_image_url, repeating)
VALUES (%s, %s, %s, %s)
"""

checkIteration = """
SELECT repeating
FROM chore_completions
WHERE chore_id = %s
AND completed_at = CURRENT_DATE
order by completed_at desc
limit 1
"""

getCompletions = """
SELECT u.username, c.title, cc.completed_at, cc.proof_image_url
FROM chore_completions cc
INNER JOIN chores c ON cc.chore_id = c.chore_id
INNER JOIN users u ON cc.user_id = u.user_id
INNER JOIN group_members gm ON gm.user_id = u.user_id
WHERE gm.group_id = %s
order by cc.completed_at desc
limit 25
offset %s
"""

insertGroupAdmin = """
INSERT INTO group_members (group_id, user_id, is_admin)
VALUES (%s, %s, 1) 
"""

# insertGroupMemnber = """
# INSERT INTO group_members (group_id, user_id, is_admin)
# VALUES (%s, %s, 0)
# """

saveInvitationCode = """
INSERT INTO group_invitations (group_id, invitation_code)
VALUES (%s, %s)
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

checkInvitationCode = """
SELECT group_id from group_invitations WHERE invitation_code = %s
"""

joinGroup = """
INSERT INTO group_members (group_id, user_id, is_admin)
VALUES (%s, %s, 0)
"""

deleteInvitation = """
DELETE FROM group_invitations
WHERE invitation_code = %s
AND group_id = %s
"""