import { loadMessages } from "./loadMessages.js";
import { sendMessage } from "./sendMessage.js";
import { closeChatWindow } from "./closeChatWindow.js";
import { openChatError } from "../errors/errors.js";
import { fetchMessages } from "../assets/fetching.js";
// import { openGroupOptions } from "./openGroupOptions.js";
import { initScrollPagination, resetPagination } from "./scrolling.js";
import { renderChatMessages } from "./renderChatMessages.js";

let socket = null;

export async function openChat() {
    closeWebSocket();
    const sectionWindow = document.getElementById("sectionWindow");
    if (!sectionWindow) return;

    // Load messages first before updating chat list so alerts are deleted
    await fetchMessages();


    // Cargar el contenido de openChat.html
    fetch("/components/openChat.html")
        .then((response) => response.text())
        .then((html) => {
            sectionWindow.innerHTML = html;

            // const chatHeader = document.getElementById("chatHeader");
            // const groupOptions = document.getElementById("groupOptions");
            // if (chatHeader) {
            //     chatHeader.textContent = senderName; // Default header text
            // }

            // if (isGroup && groupOptions) {
            //     groupOptions.classList.remove("hidden");
            //     groupOptions.addEventListener("click", () => {
            //         openGroupOptions(senderId);
            //     });
            // }

            // Cargar y mostrar los mensajes
            loadMessages();
            resetPagination();
            initScrollPagination();

            // Establecer conexión WebSocket
            const roomId = "Group_"//+senderId; ACÁ TENDRRIA QUE METER EL NOMBRE DEL GRUPO SACADO DE STORAGE O COOKIES O ALGO
            socket = new WebSocket(`ws://127.0.0.1:8000/ws/${roomId}`);
            
            socket.onmessage = (event) => {
                const data = JSON.parse(event.data);  // Parse the JSON array
                renderChatMessages(data, { append: true });
                fetchMessages(0);
            };

            // Agregar eventos a los elementos
            const sendBtn = document.getElementById("sendMessageBtn");
            const input = document.getElementById("newMessageInput");

            sendBtn.addEventListener("click", async () => {
                sendMessage();
                // const chats = await fetchChats();
                // renderUserList(chats); MAYBE CAMBIAR POR RENDER MAIN
            });

            input.addEventListener("keydown", async (e) => {
                if (e.key === "Enter") {
                    sendMessage();
                    // const chats = await fetchChats();
                    // renderUserList(chats);
                } else if (e.key === "Escape") {
                    closeChatWindow();
                }
            });

            // Esperar a que el DOM actualice y luego llamar la función
            setTimeout(() => {
                const closeBtn = document.getElementById("closeChatBtn");
                const sections = document.getElementById("sections");
                const userListDiv = document.getElementById("userListDiv");
                const sectionWindow = document.getElementById("sectionWindow");

                if (closeBtn) {
                    closeBtn.addEventListener("click", () => {
                        closeChatWindow();
                        sections.classList.remove("hidden");
                        sectionWindow.classList.add("hidden");
                        userListDiv.classList.remove("hidden");
                        closeBtn.classList.add("hidden");
                    });
                }
            }, 100);

            // Poner foco en el input
            input.focus();
        })
        .catch((err) => {
            console.error(`${openChatError}`, err);
        });
}

// Close WebSocket connection when chat window is closed
export function closeWebSocket() {
    if (socket) {
        socket.close();
        socket = null;
    }
}