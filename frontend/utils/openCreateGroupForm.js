import { handleCreateGroupFormSubmit } from "./groupValidations.js";
import { createTaskRow } from "./addTaskRow.js";

export function openCreateGroupForm() {
    let taskNumber = 0;
    const tasksContainer = document.getElementById("tasksContainer");
    const addTaskBtn = document.getElementById("addTaskBtn");
    const cancelCreateGroupBtn = document.getElementById("cancelCreateGroupBtn");
    const createGroupForm = document.getElementById("createGroupForm");

    // Add new task row
    addTaskBtn?.addEventListener("click", (e) => {
        e.preventDefault();
        const row = createTaskRow({}, taskNumber);
        tasksContainer.prepend(row);
        taskNumber++;
    });

    // Cancel button
    cancelCreateGroupBtn?.addEventListener("click", () => {
        window.history.back();
    });

    // Form submission
    createGroupForm?.addEventListener("submit", async (e) => {
        e.preventDefault();
        await handleCreateGroupFormSubmit();
    });
}

document.addEventListener('DOMContentLoaded', openCreateGroupForm);