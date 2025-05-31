import { fetchCompletedTasks } from "../assets/fetching.js";

export async function renderTasksHistory() {
    const sectionWindow = document.getElementById("sectionWindow");
    if (!sectionWindow) return;

    // Load HTML template
    const html = await fetch("/Homely/frontend/components/taskHistory.html").then(r => r.text());
    sectionWindow.innerHTML = html;

    // Set up modal functionality
    const proofModal = document.getElementById('proofModal');
    const closeModalBtn = document.getElementById('closeProofModal');
    const proofImage = document.getElementById('proofImageDisplay');
    
    closeModalBtn?.addEventListener('click', () => {
        proofModal.classList.add('hidden');
    });

    // Close modal when clicking outside image
    proofModal?.addEventListener('click', (e) => {
        if (e.target === proofModal) {
            proofModal.classList.add('hidden');
        }
    });

    // Load and display tasks
    const completedTasksList = document.getElementById('taskHistoryList');
    const completedTasks = await fetchCompletedTasks();

    if (!completedTasks?.length) {
        completedTasksList.innerHTML = '<div class="text-center text-gray-500">No hay tareas completadas.</div>';
        return;
    }

    completedTasks.forEach(task => {
        const entry = document.createElement('div');
        entry.className = 'mb-3 text-center text-[--color-text]';
        
        const proofLink = document.createElement('span');
        proofLink.className = task.proof_image_url 
            ? 'text-blue-500 hover:underline cursor-pointer ml-1'
            : 'text-gray-400 ml-1';
        proofLink.textContent = task.proof_image_url ? 'PRUEBA' : 'SIN PRUEBA';

        if (task.proof_image_url) {
            proofLink.addEventListener('click', () => {
                proofImage.src = task.proof_image_url;
                proofModal.classList.remove('hidden');
            });
        }

        entry.innerHTML = `${task.username} completó "${task.title}" el ${task.completed_at} - `;
        entry.appendChild(proofLink);
        
        completedTasksList.appendChild(entry);
    });
}