import { joinGroup } from "../assets/fetching.js";

async function joinGroupForm() {
    const groupAccess = document.getElementById("groupAccess");
    groupAccess.addEventListener("submit", async (e) => {
        e.preventDefault(); // Prevent the default form submission
        const code = document.getElementById("groupCode").value;
        await joinGroup(code);
    });
}

document.addEventListener('DOMContentLoaded', joinGroupForm);