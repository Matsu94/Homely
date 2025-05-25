import { URL, token, group_id, currentUserId } from '../constants/const.js';
import * as errors from '../errors/errors.js';


export async function registerUser(username, password) {
    // Realizar la solicitud fetch al endpoint /register
    try {
        const response = await fetch(`${URL}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`${errors.registerError} ${response.status} - ${JSON.stringify(errorData)}`);
        }

        const response2 = await fetch(`${URL}/token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        if (!response2.ok) {
            const errorData = await response2.json();
            throw new Error(`${errors.requestError} ${response2.status} - ${JSON.stringify(errorData)}`);
        }
        const data2 = await response2.json();
        sessionStorage.setItem('token', data2.access_token);
        sessionStorage.setItem('username', username);
        sessionStorage.setItem('user_id', data2.user_id);

        window.location.href = '../components/opcionesUsuarioNuevo.html';
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('passMsg').textContent = `${error}`;
    }
}

export async function getInvitationCode() {
    try {
        const response = await fetch(`${URL}/create_group_invitation/${group_id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` // Descomenta si tu endpoint requiere token
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Error al obtener chats: ${response.status} - ${JSON.stringify(errorData)}`);
        }

        const data = await response.json();

        return data;

    } catch (error) {
        throw error;
    }
}

export async function joinGroup(code) {
    // Unir usuario a grupo mediante invitación
    try {
        const response = await fetch(`${URL}/join_group`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` // Descomenta si tu endpoint requiere token
            },
            body: JSON.stringify({ group_code: code })

        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`${errors.joinGroupError} ${response.status} - ${JSON.stringify(errorData)}`);
        }

        const data = await response.json();
        sessionStorage.setItem('group_id', data); // Guardar el ID del grupo al que se unió
        window.location.href = '../inicio.html';

    } catch (error) {
        console.error('Error:', error);
        document.getElementById('passwordError').textContent = `${errors.errorStartSession}`;
    }
}

export async function fetchToken(username, password) {
    // Realizar la solicitud fetch al endpoint /token
    try {
        const response = await fetch(`${URL}/token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        if (!response.ok) {
            throw new Error(errors.requestError);
        }

        const data = await response.json();
        sessionStorage.setItem('token', data.access_token);
        sessionStorage.setItem('username', username);
        sessionStorage.setItem('user_id', data.user_id);
        sessionStorage.setItem('group_id', data.group_id);
        if (data.group_id === null) {
            window.location.href = '../components/opcionesUsuarioNuevo.html';
        } else {
            window.location.href = '../inicio.html';
        }
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('passwordError').textContent = `${errors.errorStartSession}`;
    }
}

export async function fetchChats() {
    try {
        // Si requieres autenticación

        const response = await fetch(`${URL}/chats`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` // Descomenta si tu endpoint requiere token
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Error al obtener chats: ${response.status} - ${JSON.stringify(errorData)}`);
        }
        const data = await response.json();
        return [...data]; // Esperamos un array de objetos con usuarios/grupos, el último mensaje y los grps sin msjs
    } catch (error) {
        throw error;
    }
}

export async function fetchUnreadMessages() {
    try {

        // Fetch messages from the backend
        const response = await fetch(`${URL}/check_messages`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`${errors.errorFetchingMessages}, ${response.status}`);
        }

        // Parse the JSON response (this contains all the messages)
        const messages = await response.json();

        // Send the IDs to the change_state endpoint
        const changeStateResponse = await fetch(`${URL}/change_state/${2}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(messages) // Send the IDs as the body
        });

        if (!changeStateResponse.ok) {
            throw new Error(`${errors.errorChangingMessageState} ${changeStateResponse.status}`);
        }

        return messages; // Return the messages for rendering in the frontend
    } catch (error) {
        console.error(error);
        throw error;
    }
}

//Para cargar los mensajes
export async function fetchMessages(offset = 0) {
    try {

        // Fetch messages from the backend
        const response = await fetch(`${URL}/receive_messages/?offset=${offset}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`${errors.errorFetchingMessages}, ${response.status}`);
        }

        // Parse the JSON response (this contains all the messages)
        const messages = await response.json();

        // Send the IDs to the change_state endpoint
        const changeStateResponse = await fetch(`${URL}/change_state/${3}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(messages) // Send the IDs as the body
        });

        if (!changeStateResponse.ok) {
            throw new Error(`${errors.errorChangingMessageState} ${changeStateResponse.status}`);
        }

        return messages; // Return the messages for rendering in the frontend
    } catch (error) {
        console.error(error);
        throw error;
    }
}

// mandar mensajes
export async function postMessage(messageObj) {
    try {
        const response = await fetch(`${URL}/sendMessage`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(messageObj)
        });

        if (!response.ok) {
            throw new Error(`${errors.sendMessagesError}, ${response.status}`);
        }
        // El backend responde con el id del mensaje
        const data = await response.json();
        return data; // p. ej. { "message_id": 12 }
    } catch (error) {
        throw error;
    }
}

// estados mensaje grupo
export async function fetchGroupMessageStatus(messageId) {
    try {
        const response = await fetch(`${URL}/group_message_status/${messageId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`${errors.errorFetchingMessageStatus}, ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        throw error;
    }
}

// crear grupo + tareas
export async function createGroup(groupObj, tasks) {
    try {
        const response = await fetch(`${URL}/create_group`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(groupObj)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`${errors.createGroupError} ${response.status} - ${JSON.stringify(errorData)}`);
        }

        const data = await response.json();
        sessionStorage.setItem('group_id', data); // Guardar el ID del grupo creado


        const payload = {
            group_id: data,
            tasks: tasks
        };
        const response2 = await fetch(`${URL}/add_tasks`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });

        if (!response2.ok) {
            const errorData = await response2.json();
            throw new Error(`${errors.createTaskError} ${response2.status} - ${JSON.stringify(errorData)}`);
        }

        const data2 = await response2.json();
        window.location.href = '../inicio.html';

    } catch (error) {
        throw error;
    }
}

// CARGAR TAREAS GRUPO
export async function fetchGroupTasks(group_id) {
    try {
        const response = await fetch(`${URL}/get_tasks/${group_id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        if (!response.ok) {
            throw new Error(`${errors.getGroupTasksError}, ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        throw error;
    }
}

// UPLOAD IMAGE
export async function uploadImage(formData) {
    try {
        const uploadResponse = await fetch(`${URL}/upload_image`, {
            method: "POST",
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });

        if (!uploadResponse.ok) {
            const error = await uploadResponse.json();
            throw new Error(`Error subiendo imagen: ${JSON.stringify(error)}`);
        }

        const { image_url } = await uploadResponse.json();
        return image_url; // Retorna la URL de la imagen

    } catch (err) {
        alert("Error al completar la tarea: " + err.message);
    }
}

// COMPLETAR TAREA
export async function completeTask(task_id, imgURL, periodicity) {
    // Unir usuario a grupo mediante invitación
    try {
        const response = await fetch(`${URL}/complete_task/${task_id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                img_url: imgURL,
                periodicity
            })

        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`${errors.completeTaskError} ${response.status} - ${JSON.stringify(errorData)}`);
        }
        const data = await response.json();

    } catch (error) {
        throw error;
    }
}


export async function modifyTask(task_id, taskObj) {
    try {
        const response = await fetch(`${URL}/update_task/${task_id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(taskObj)
        });

        if (!response.ok) {
            throw new Error(`${errors.updateTaskError}, ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        throw error;
    }
}

// ELIMINAR TAREA
export async function deleteTask(task_id) {
    try {
        const response = await fetch(`${URL}/delete_task/${task_id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`${errors.deleteTaskError}, ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        throw error;
    }
}



//CARGAR INFO GRUPO
export async function fetchGroupInfo(group_id) {
    try {
        // Si requieres autenticación

        const response = await fetch(`${URL}/group_info/${group_id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`${errors.getGroupInfoError}, ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        throw error;
    }
}

// CAMBIAR NOMBRE GRUPO
export async function updateGroupName(group_id, name) {
    try {


        const response = await fetch(`${URL}/update_name/${group_id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ name })
        });

        if (!response.ok) {
            throw new Error(`${errors.updateGroupError}, ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        throw error;
    }
}

// CAMBIAR DESCRIPCION GRUPO
export async function updateGroupDescription(group_id, description) {
    try {
        const response = await fetch(`${URL}/update_description/${group_id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ description })
        });

        if (!response.ok) {
            throw new Error(`${errors.updateGroupError}, ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        throw error;
    }
}

//CARGAR USUARIOS DE GRUPO
export async function fetchUsersFromGroup(group_id) {
    try {
        const response = await fetch(`${URL}/get_members/${group_id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        if (!response.ok) {
            throw new Error(`${errors.getUsersError}, ${response.status}`);
        }
        return await response.json();
        // Esto será un array de objetos: [{ user_id, username, password }, ...]
    } catch (error) {
        throw error; // Relanzamos el error para manejarlo fuera
    }
}

export async function removeUserFromGroup(group_id, userId) {
    try {


        const response = await fetch(`${URL}/remove_user/${group_id}/${userId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`${errors.removeUserError}, ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        throw error;
    }
}

export async function updateUserToAdmin(group_id, userId) {
    try {


        const response = await fetch(`${URL}/add_admin/${group_id}/${userId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`${errors.promoteUserError}, ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        throw error;
    }
}

// export async function addUsersToGroup(group_id, usersIds) {
//     try {

//         const response = await fetch(`${URL}/add_users/${group_id}`, {
//             method: 'PUT',
//             headers: {
//                 'Content-Type': 'application/json',
//                 'Authorization': `Bearer ${token}`
//             },
//             body: JSON.stringify({ Members: usersIds })
//         });
//         if (!response.ok) {
//             throw new Error(`${errors.promoteUserError}, ${response.status}`);
//         }
//         return await response.json();
//     } catch (error) {
//         throw error;
//     }
// }

export async function leaveGroup(group_id) {
    try {
        const response = await fetch(`${URL}/leave_group/${group_id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.detail);  // Error means they can't leave
        }        

        // Clear session storage and redirect
        sessionStorage.removeItem('group_id');
        window.location.href = 'components/opcionesUsuarioNuevo.html';
        return { ok: true, data };  // Successful case

    } catch (error) {
        return { ok: false, data: error.message };  // Return error details
    }
}
