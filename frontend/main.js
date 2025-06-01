// import { openCreateGroupForm } from "./utils/openCreateGroupForm.js";
import { getUsersError } from "./errors/errors.js";
import { fetchChats, getInvitationCode, leaveGroup } from "./assets/fetching.js";
import { openChangeBackgroundGrid } from "./utils/openChangeBackgroundGrid.js";
import { token, group_id } from "./constants/const.js";
import { renderMain } from "./utils/renderMain.js";

// Inicialización
window.addEventListener("DOMContentLoaded", () => {

  async function init() {
    try {
      if (!token) {
        window.location.href = `/login/login.html`;
      }

      // const chats = await fetchChats();

      await renderMain();

      // const createGroupBtn = document.getElementById("createGroupBtn");
      // if (createGroupBtn) {
      //   createGroupBtn.addEventListener("click", () => {
      //     openCreateGroupForm();
      //   });
      // }

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

      // const openCreateGroup = document.getElementById("createGroupBtn");
      // openCreateGroup.addEventListener("click", () => {
      //   userListDiv.classList.add("hidden");
      //   sections.classList.add("hidden");
      // });

      changeBackgroundBtn.addEventListener("click", () => {
        userListDiv.classList.add("hidden");
        sections.classList.add("hidden");
      });

      const groupInvitationCodeBtn = document.getElementById("groupInvitation");
      const groupInvitationCodeContainer = document.getElementById("groupInvitationCodeContainer");
      const groupInvitationCode = document.getElementById("code");
      groupInvitationCodeBtn.addEventListener("click", async () => {
        groupInvitationCodeContainer.classList.toggle("hidden");
        groupInvitationCode.innerText = await getInvitationCode();
      });

      const closeCodeWindowBtn = document.getElementById("closeCodeWindow");
      closeCodeWindowBtn.addEventListener("click", () => {
        groupInvitationCodeContainer.classList.add("hidden");
      });

      const leaveGroupBtn = document.getElementById("leaveGroup");
      leaveGroupBtn.addEventListener("click", async () => {
        if (confirm("¿Estás seguro de que quieres abandonar el grupo?")) {
          const result = await leaveGroup(group_id);
          if (!result.ok) {
            alert(result.error); // Display error using an alert
            console.error("Failed to leave group:", result.error);
          }
          // Success is handled by redirection in fetching.js, no else needed here if redirection is the only success action
        }
      });



    } catch (error) {
      console.error(getUsersError, error);
    }
  }

  init();
});
