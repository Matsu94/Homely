import { openChat } from "./openChat.js";
import { formatDate } from './formatDate.js';
import { renderWeeklyChores } from "./renderWeeklyChores.js";
import { currentUserId } from "../constants/const.js";
import { fetchChats, addTaskGroup } from "../assets/fetching.js";
import { renderTasksHistory } from "./renderTasksHistory.js";
import { createTaskRow, getTaskDataFromRow } from "./addTaskRow.js";


export async function renderMain(unreadLookup = {}) {


  const sections = document.getElementById('sections');
  if (!sections) return;

  sections.innerHTML = '';

  const chat = await fetchChats();

  /* TENGO QUE METER FETCH LAST MESSAGE Y LO DE LAS ALERTAS PARA LA SECCION DE CHAT, TMB LA CREACIÓN DE LOS BOTONOS DE LAS SECCIONES Y SACARLOS DEL 
      HTML
  */

  const chatSection = document.createElement('div');
  chatSection.className = "m-1 h-40 sm:h-48 flex items-center justify-center hover:bg-[var(--color-border)] cursor-pointer rounded-lg border-4 border-gray-300 relative";

  // Create a container to hold title + message vertically
  const infoDiv = document.createElement('div');
  infoDiv.className = "flex flex-col items-center text-center";  // Stack + center horizontally

  // Title
  const chatTitle = document.createElement('span');
  chatTitle.className = "title-font text-[var(--color-text)]";
  chatTitle.innerText = "Chat";

  // Last message
  const lastMessageEl = document.createElement('div');
  lastMessageEl.className = "mini-font-size text-[var(--color-text)] truncate overflow-hidden whitespace-nowrap overflow-ellipsis max-w-[120px]";
  lastMessageEl.innerText = chat.content ?? chat.description ?? "No hay mensajes.";

  infoDiv.appendChild(chatTitle);
  infoDiv.appendChild(lastMessageEl);

  // Append the column into the centered container
  chatSection.appendChild(infoDiv);

  // Timestamp (optional placement)
  const timestampEl = document.createElement('div');
  timestampEl.className = "mini-font-size text-[var(--color-text)] absolute bottom-1 right-2";  // Absolute placement if needed
  if (chat.date || chat.created_at) {
    const date = new Date(chat.date ?? chat.created_at);
    timestampEl.innerText = formatDate(date);
  } else {
    timestampEl.innerText = "";
  }
  chatSection.appendChild(timestampEl);


  // Add unread message alert badge
  const unreadCount = unreadLookup[chat.chat_name] || 0;
  if (unreadCount > 0) {
    const unreadBadge = document.createElement('div');
    unreadBadge.className = "absolute right-2 top-1 bg-[var(--color-alert)] text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full";
    unreadBadge.innerText = unreadCount;
    chatSection.appendChild(unreadBadge);
  }

  // Click event to open chat
  chatSection.addEventListener("click", () => {
    openChat();

    if (window.innerWidth < 768) {
      document.getElementById("userListDiv").classList.add("hidden");
      document.getElementById("sectionWindow").classList.remove("hidden");
    }
  });


  const choresSection = document.createElement('div');
  choresSection.className = "m-1 h-40 sm:h-48 flex items-center justify-center hover:bg-[var(--color-border)] cursor-pointer rounded-lg border-4 border-gray-300";
  const choresTitle = document.createElement('span');
  choresTitle.className = "ml-20 title-font text-[var(--color-text)]";
  choresTitle.innerText = "Tareas";
  choresSection.appendChild(choresTitle);
  sections.appendChild(choresSection);

  // Add button
  const addTaskBtn = document.createElement("button");
  addTaskBtn.type = "button";
  addTaskBtn.textContent = "+";
  addTaskBtn.classList.add("text-[var(--color-add)]", "ml-10", "text-xl", "hover:bg-[var(--color-add)]", "rounded", "w-8", "border-2", "border-[var(--color-add)]", "hover:text-white");
  choresSection.appendChild(addTaskBtn);
  addTaskBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    renderWeeklyChores();

    setTimeout(() => {
      const taskModal = document.getElementById("taskModal");
      const taskModalContent = document.getElementById("taskModalContent");

      // Create button container with justify-between
      const buttonContainer = document.createElement("div");
      buttonContainer.classList.add("flex", "justify-center", "gap-20", "mt-4", "w-full");

      taskModal.classList.remove("hidden");
      taskModalContent.innerHTML = '';

      const row = createTaskRow({}, 0);
      taskModalContent.appendChild(row);

      // Submit button
      const submitBtn = document.createElement("button");
      submitBtn.type = "button";
      submitBtn.textContent = "Guardar";
      submitBtn.className = "px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700";

      // Cancel button
      const cancelBtn = document.createElement("button");
      cancelBtn.type = "button";
      cancelBtn.textContent = "Cancelar";
      cancelBtn.className = "px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500 ml-2";

      // Append to modal footer
      buttonContainer.append(submitBtn, cancelBtn);
      taskModalContent.appendChild(buttonContainer);

      // Cancel closes modal
      cancelBtn.addEventListener("click", () => {
        taskModal.classList.add("hidden");
      });

      // Submit sends task
      submitBtn.addEventListener("click", async () => {
        const task = getTaskDataFromRow(row, 0);

        try {
          await addTaskGroup(task);
          taskModal.classList.add("hidden");
          renderWeeklyChores(); // Refresh tasks
        } catch (err) {
          console.error("Error adding task:", err);
          alert("No se pudo agregar la tarea. Revisa los datos e intenta nuevamente.");
        }
      });
    }, 50); // Delay in ms (adjust if needed)
  });



  choresSection.addEventListener("click", () => {
    renderWeeklyChores();

    if (window.innerWidth < 768) {
      document.getElementById("userListDiv").classList.add("hidden");
      document.getElementById("sectionWindow").classList.remove("hidden");
    }
  });

  const logsSection = document.createElement('div');
  logsSection.className = "m-1 h-40 sm:h-48 flex items-center justify-center hover:bg-[var(--color-border)] cursor-pointer rounded-lg border-4 border-gray-300";
  const logsTitle = document.createElement('span');
  logsTitle.className = "title-font text-[var(--color-text)]";
  logsTitle.innerText = "Historial";
  logsSection.appendChild(logsTitle);
  sections.appendChild(logsSection);

  logsSection.addEventListener("click", () => {
    renderTasksHistory();

    if (window.innerWidth < 768) {
      document.getElementById("userListDiv").classList.add("hidden");
      document.getElementById("sectionWindow").classList.remove("hidden");
    }
  });

  // sections.appendChild(chatSection);


  const stockSection = document.createElement('div');
  stockSection.className = "m-1 h-40 sm:h-48 flex items-center justify-center hover:bg-[var(--color-border)] cursor-pointer rounded-lg border-4 border-gray-300";
  const stockTitle = document.createElement('span');
  stockTitle.className = "title-font text-[var(--color-text)]";
  stockTitle.innerText = "Inventario";
  stockSection.appendChild(stockTitle);
  // sections.appendChild(stockSection);
}
