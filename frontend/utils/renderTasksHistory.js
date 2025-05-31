import { fetchCompletedTasks } from "../assets/fetching.js";

let currentOffset = 0;
let isLoading = false;

export async function renderTasksHistory() {
    currentOffset = 0;
    const sectionWindow = document.getElementById("sectionWindow");
    if (!sectionWindow) return;

    // Load HTML template
    const html = await fetch("/Homely/frontend/components/taskHistory.html").then(r => r.text());
    sectionWindow.innerHTML = html;

    // Set up modal functionality
    const proofModal = document.getElementById('proofModal');
    const closeModalBtn = document.getElementById('closeProofModal');

    closeModalBtn?.addEventListener('click', () => {
        proofModal.classList.add('hidden');
    });

    proofModal?.addEventListener('click', (e) => {
        if (e.target === proofModal) {
            proofModal.classList.add('hidden');
        }
    });

    // Load and display initial tasks
    const completedTasksList = document.getElementById('taskHistoryList');
    await loadMoreTasks(completedTasksList);

    // Start at the bottom (most recent tasks)
    // Wait for the next render cycle to ensure DOM is updated
    setTimeout(() => {
        completedTasksList.scrollTop = completedTasksList.scrollHeight;
    }, 0);

    // Set up infinite scroll (loading older tasks when scrolling up)
    completedTasksList.addEventListener('scroll', async () => {
        if (completedTasksList.scrollTop === 0 && !isLoading) {
            await loadMoreTasks(completedTasksList, true);
        }
    });
}

async function loadMoreTasks(container, prepend = false) {
    if (isLoading) return;
    isLoading = true;

    try {
        // Show loading indicator if prepending
        if (prepend) {
            const loader = document.createElement('div');
            loader.className = 'text-center py-2 text-gray-500';
            loader.textContent = 'Cargando más tareas...';
            container.prepend(loader);
        }

        const tasks = await fetchCompletedTasks(currentOffset);

        if (prepend) {
            // Remove loading indicator
            container.removeChild(container.firstChild);
        }

        if (!tasks?.length) {
            if (currentOffset === 0) {
                container.innerHTML = '<div class="text-center text-gray-500">No hay tareas completadas.</div>';
            }
            return;
        }

        // Create document fragment for better performance
        const fragment = document.createDocumentFragment();

        tasks.forEach(task => {
            const entry = document.createElement('div');
            entry.className = 'mb-3 text-center text-[--color-text]';

            const proofLink = document.createElement('span');
            proofLink.className = task.proof_image_url
                ? 'text-blue-500 hover:underline cursor-pointer ml-1'
                : 'text-gray-400 ml-1';
            proofLink.textContent = task.proof_image_url ? 'PRUEBA' : 'SIN PRUEBA';

            if (task.proof_image_url) {
                proofLink.addEventListener('click', () => {
                    // Windows path normalization (forward slashes work in browsers)
                    const normalizedPath = task.proof_image_url.replace(/\\/g, '/');
                    const proofModal = document.getElementById('proofModal');
                    const proofImage = document.getElementById('proofImageDisplay');
                    proofImage.src = `/${normalizedPath}`;
                    proofModal.classList.remove('hidden');
                });
            }

            entry.innerHTML = `${task.username} completó "${task.title}" el ${task.completed_at} - `;
            entry.appendChild(proofLink);

            fragment.prepend(entry);
        });

        if (prepend) {
            // Save current scroll position
            const oldHeight = container.scrollHeight;
            const oldScroll = container.scrollTop;

            // Prepend new items
            container.prepend(fragment);

            // Restore scroll position (adjusted for new content)
            container.scrollTop = container.scrollHeight - oldHeight + oldScroll;
        } else {
            container.appendChild(fragment);
        }

        currentOffset += tasks.length;

    } catch (error) {
        console.error('Error loading tasks:', error);
        if (prepend && container.firstChild?.textContent === 'Cargando más tareas...') {
            container.removeChild(container.firstChild);
        }
    } finally {
        isLoading = false;
    }
}