
import { openCreateGroupForm } from "./utils/openCreateGroupForm.js";
import { getUsersError } from "./errors/errors.js";
import { fetchChats} from "./assets/fetching.js";
import { openChangeBackgroundGrid } from "./utils/openChangeBackgroundGrid.js";
import { token } from "./constants/const.js";
import { renderMain } from "./utils/renderMain.js";

// Inicialización
window.addEventListener("DOMContentLoaded", () => {

  async function init() {
    try {
      if (!token) {
        window.location.href = `/Homely/frontend/login/login.html`;
      }

      const chats = await fetchChats();
      
      await renderMain(chats);

      const createGroupBtn = document.getElementById("createGroupBtn");
      if (createGroupBtn) {
        createGroupBtn.addEventListener("click", () => {
          openCreateGroupForm();
        });
      }

      const changeBackgroundBtn = document.getElementById("changeBackgroundBtn");
      if (changeBackgroundBtn) {
        changeBackgroundBtn.addEventListener("click", () => {
          openChangeBackgroundGrid();
        });
      }


      // Menú desplegable
      const menuBtn = document.getElementById("menuBtn");
      const dropdownMenu = document.getElementById("dropdownMenu");

      menuBtn.addEventListener("click", () => {
        dropdownMenu.classList.toggle("hidden");
      });
      dropdownMenu.addEventListener("mouseleave", () => {
        dropdownMenu.classList.add("hidden");
      });

      // Implementación versión móvil
      const sections = document.getElementById("sections");
      const chatContainer = document.getElementById("chatContainer");
      const userListDiv = document.getElementById("userListDiv");

      document.querySelectorAll(".chat-item").forEach((chatItem) => { // ESTE ES EL CACHO DE CHAT, TENGO QUE REDUCIRLO A 1 CHAT Y ARREGLAR LA VARIABLE
        chatItem.addEventListener("click", () => {
          userListDiv.classList.add("hidden");
          sections.classList.add("hidden");
          chatContainer.classList.remove("hidden");
        });
      });

      const openCreateGroup = document.getElementById("createGroupBtn");
      openCreateGroup.addEventListener("click", () => {
        userListDiv.classList.add("hidden");
        sections.classList.add("hidden");
      });

      changeBackgroundBtn.addEventListener("click", () => {
        userListDiv.classList.add("hidden");
        sections.classList.add("hidden");
      });

    } catch (error) {
      console.error(getUsersError, error);
    }
  }

  init();
});
