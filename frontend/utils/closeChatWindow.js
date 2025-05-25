import { closeWebSocket } from "./openChat.js"; // Import the WebSocket cleanup function

// Cerrar chat
export function closeChatWindow() {
    const sectionWindow = document.getElementById("sectionWindow");
    if (!sectionWindow) return;
    sectionWindow.innerHTML = `
      <p class="text-xl text-center px-4">
        Pulsa en una conversación para ver los mensajes
      </p>
    `;
    closeWebSocket(); // Close the WebSocket connection
}