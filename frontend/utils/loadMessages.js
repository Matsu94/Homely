import { fetchMessages } from "../assets/fetching.js";
import { renderChatMessages } from "./renderChatMessages.js";
import { currentUserId } from "../constants/const.js";
import { getMessagesError } from "../errors/errors.js";

let offset = 0;
// loadMessages llama a fetchMessages y luego renderChatMessages
export async function loadMessages() {
    try {
        const messages = await fetchMessages(offset);

        renderChatMessages(messages);
    } catch (error) {
        console.error(getMessagesError, error);
    }
}

