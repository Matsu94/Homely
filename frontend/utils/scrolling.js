import { fetchMessages } from "../assets/fetching.js";
import { renderChatMessages } from "./renderChatMessages.js";

// Variables globales
let currentOffset = 0;
const limit = 10;
let isLoadingMessages = false;
let hasMoreMessages = true;  // Nueva variable para evitar loops innecesarios

export function initScrollPagination() {
    const messagesContainer = document.getElementById("messagesContainer");
    if (!messagesContainer) return;

    messagesContainer.addEventListener("scroll", async function() {
        // Detener si ya no hay más mensajes
        if (!hasMoreMessages) return;

        if (this.scrollTop === 0 && !isLoadingMessages) {
            isLoadingMessages = true;
            currentOffset += limit;

            await loadOlderMessages();
            isLoadingMessages = false;
        }
    });
}

async function loadOlderMessages() {
    try {
        const messagesContainer = document.getElementById("messagesContainer");
        const previousScrollHeight = messagesContainer.scrollHeight;

        const olderMessages = await fetchMessages(currentOffset);
        if (olderMessages.length < limit) {
            hasMoreMessages = false; // No hay más mensajes para cargar
        }
        renderChatMessages(olderMessages, { prepend: true });

        // Mantener la posición del scroll
        const newScrollHeight = messagesContainer.scrollHeight;
        messagesContainer.scrollTop = newScrollHeight - previousScrollHeight;
    } catch (error) {
        console.error("Error cargando mensajes antiguos:", error);
    }
}

// Resetear el estado cuando cambia el chat
export function resetPagination() {
    currentOffset = 0;
    hasMoreMessages = true;
}
