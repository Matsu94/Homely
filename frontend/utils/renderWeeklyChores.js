import { fetchGroupTasks, completeTask, modifyTask, deleteTask } from "../assets/fetching.js";
import { group_id, currentUserId } from "../constants/const.js";
import { createTaskRow, getTaskDataFromRow } from "./addTaskRow.js";


// import { addTaskRow } from "./addTaskRow.js";

export async function renderWeeklyChores() {
    const sectionWindow = document.getElementById("sectionWindow");
    if (!sectionWindow) return;

    let tasks = await fetchGroupTasks(group_id);

    // Cargar el contenido de groupTasksSection.html
    fetch("/Homely/frontend/components/groupTasksSection.html")
        .then((response) => response.text())
        .then((html) => {
            sectionWindow.innerHTML = html;

            // Attach modal event logic
            function setupTaskClick(box, task) {
                box.addEventListener('click', () => {
                    const modTitle = document.getElementById("modalTitle").textContent = task.title;
                    document.getElementById("modalDescription").textContent = task.description || "Sin descripción";

                    const modal = document.getElementById("taskModal");
                    modal.classList.remove("hidden");

                    // Add handlers for action buttons
                    document.getElementById("completeBtn").onclick = () => handleComplete(task.chore_id, task.periodicity);
                    document.getElementById("modifyBtn").onclick = () => handleModify(task);
                    document.getElementById("deleteBtn").onclick = () => handleDelete(task.chore_id);
                });
            }

            // Close button
            document.getElementById("closeModal").addEventListener("click", () => {
                renderWeeklyChores(); // Re-render to reset the modal
            });


            // const { weekStart, weekEnd, byDay: weekDates } = getCurrentWeekDates();
            const { monday, sunday, weekDates } = getCurrentWeekDates();

            const daysMap = {
                'Lunes': 'monday',
                'Martes': 'tuesday',
                'Miércoles': 'wednesday',
                'Jueves': 'thursday',
                'Viernes': 'friday',
                'Sábado': 'saturday',
                'Domingo': 'sunday'
            };

            const phoneDaysMap = {
                'phoneMonday': 'monday',
                'phoneTuesday': 'tuesday',
                'phoneWednesday': 'wednesday',
                'phoneThursday': 'thursday',
                'phoneFriday': 'friday',
                'phoneSaturday': 'saturday',
                'phoneSunday': 'sunday'
            };

            const phoneDaysContainer = document.getElementById("phoneDaysContainer");

            // Inside renderWeeklyChores before looping through tasks:
            Object.entries(weekDates).forEach(([dayKey, dateStr]) => {
                const container = document.getElementById(dayKey);
                if (container) {
                    container.setAttribute("data-date", dateStr);
                }
                if (window.innerWidth < 768) {
                    container.classList.add("hidden"); // Hide all day containers on mobile
                }
            });


            const phoneDaysContainerBackBtn = document.getElementById("phoneDaysContainerBackBtn");
            if (window.innerWidth > 768) {
                phoneDaysContainerBackBtn.classList.add("hidden"); // Hide phone days container on desktop
            }

            phoneDaysContainerBackBtn.addEventListener("click", () => {
                sectionWindow.classList.add("hidden");
                document.getElementById("userListDiv").classList.remove("hidden");
            });

            const daysContainerBackBtn = document.getElementById("daysContainerBackBtn");
            if (window.innerWidth > 768 || phoneDaysContainer.classList.contains("hidden")) {
                daysContainerBackBtn.classList.add("hidden"); // Hide back button on desktop
            }
            daysContainerBackBtn.addEventListener("click", () => {
                daysContainerBackBtn.classList.add("hidden"); // Hide back button
                for (const dayValue of Object.values(daysMap)) {
                    const element = document.getElementById(dayValue);
                    if (!element.classList.contains("hidden")) {
                        element.classList.toggle("hidden"); // Hide all day containers
                    }
                }
                phoneDaysContainer.classList.toggle("hidden");
            });

            for (const [phoneDayKey, phoneDayValue] of Object.entries(phoneDaysMap)) {
                const element = document.getElementById(phoneDayKey);
                if (element) {
                    element.addEventListener("click", () => {
                        daysContainerBackBtn.classList.remove("hidden"); // Hide back button
                        const dayContainer = document.getElementById(phoneDayValue);
                        if (dayContainer) {
                            dayContainer.classList.toggle("hidden"); // Toggle visibility of the specific day container
                        }
                        phoneDaysContainer.classList.toggle("hidden");
                    });
                }
            }


            function mapCompletions(task) {
                const result = new Map();
                if (task.completion_dates && task.completion_repeats) {
                    const dates = task.completion_dates.split(',');
                    const reps = task.completion_repeats.split(',').map(r => parseInt(r));
                    for (let i = 0; i < dates.length; i++) {
                        if (!result.has(dates[i])) {
                            result.set(dates[i], []);
                        }
                        result.get(dates[i]).push(reps[i]);
                    }
                }
                return result;
            }


            tasks.forEach(task => {
                const completionsMap = mapCompletions(task);

                const box = document.createElement("div");
                box.classList.add("w-full", "p-2", "mb-1", "shadow", "text-sm", "cursor-pointer", "text-center");
                box.textContent = task.title;

                switch (task.periodicity) {
                    case "Diaria":
                    case "Mensual":
                    case "Anual": {
                        // Style
                        const colorClass = {
                            "Diaria": ["bg-[--color-daily]", "hover:bg-[var(--color-hoverdaily)]"],
                            "Mensual": ["bg-[--color-month]", "hover:bg-[var(--color-hovermonth)]"],
                            "Anual": ["bg-[--color-year]", "hover:bg-[var(--color-hoveryear)]"]
                        }[task.periodicity];
                        box.classList.add(...colorClass);

                        Object.entries(weekDates).forEach(([dayKey, dateStr]) => {
                            const dayContainer = document.getElementById(dayKey);

                            if (!completionsMap.has(dateStr)) {
                                const boxClone = box.cloneNode(true);
                                setupTaskClick(boxClone, task);
                                dayContainer?.appendChild(boxClone);
                            }
                        });
                        break;
                    }

                    case "Dos veces al día": {
                        box.classList.add("bg-[--color-twice]", "hover:bg-[var(--color-hovertwice)]");
                        Object.entries(weekDates).forEach(([dayKey, dateStr]) => {
                            const dayContainer = document.getElementById(dayKey);
                            const repeats = completionsMap.get(dateStr) || [];

                            const count1 = repeats.filter(r => r === 1).length;
                            const count2 = repeats.filter(r => r === 2).length;

                            if (count1 === 0) {
                                const first = box.cloneNode(true);
                                setupTaskClick(first, task);
                                dayContainer?.appendChild(first);
                            }
                            if (count2 === 0) {
                                const second = box.cloneNode(true);
                                setupTaskClick(second, task);
                                dayContainer?.appendChild(second);
                            }
                        });
                        break;
                    }

                    case "Días Especficos": {
                        box.classList.add("bg-[--color-days]", "hover:bg-[var(--color-hoverdays)]");
                        if (task.specific_days) {
                            const days = task.specific_days.split(',').map(d => d.trim());

                            days.forEach(spanishDay => {
                                const containerId = daysMap[spanishDay];
                                const container = document.getElementById(containerId);
                                const date = container?.getAttribute("data-date");

                                if (container && date && !completionsMap.has(date)) {
                                    const clonedBox = box.cloneNode(true);
                                    setupTaskClick(clonedBox, task);
                                    container.appendChild(clonedBox);
                                }
                            });
                        }
                        break;
                    }

                    default:
                        if (task.type === "occasional" && task.date_limit) {
                            const taskDate = new Date(task.date_limit);
                            taskDate.setHours(0, 0, 0, 0); // Set to start of the day

                            if ((taskDate >= monday && taskDate <= sunday) && completionsMap.size === 0) {
                                const weekday = taskDate.toLocaleDateString("es-ES", { weekday: "long" });
                                const dayId = daysMap[capitalizeFirstLetter(weekday)];
                                box.classList.add("bg-[--color-date]", "hover:bg-[var(--color-hoverdate)]");

                                const container = document.getElementById(dayId);
                                if (container) {
                                    const boxClone = box.cloneNode(true);
                                    setupTaskClick(boxClone, task);
                                    container.appendChild(boxClone);
                                }
                            }
                        }
                        break;
                }
            });

        })
        .catch((error) => {
            console.error("Error loading group tasks section:", error);
        });
}

async function handleComplete(choreId, periodicity) {
    const fileInput = document.getElementById("proofImage");
    const file = fileInput.files[0];

    if (!file) {
        // Now complete the task using the returned URL
        await completeTask(choreId, null, periodicity);
        renderWeeklyChores();
        return;
    }

    // Upload the image to backend first
    const formData = new FormData();
    formData.append("file", file);
    formData.append("chore_id", choreId);

    const image_url = await uploadImage(formData)

    // Now complete the task using the returned URL
    await completeTask(choreId, image_url, periodicity);
    renderWeeklyChores();
}


function handleModify(task) {
    const modalContent = document.getElementById("taskModalContent");
    const tasksContainer = document.getElementById("tasksContainer");

    // Hide existing modal content
    modalContent.classList.add("hidden"); // Clear modal content

    // Create form with current task data
    const row = createTaskRow(task, 0);
    tasksContainer.appendChild(row);
    document.getElementById("removeTaskBtn").classList.add("hidden");

    // Create button container with justify-between
    const buttonContainer = document.createElement("div");
    buttonContainer.classList.add("flex", "justify-center", "gap-20", "mt-4", "w-full");

    // Add submit button
    const submitBtn = document.createElement("button");
    submitBtn.type = "button";
    submitBtn.textContent = "Guardar Cambios";
    submitBtn.classList.add("px-4", "py-2", "bg-[var(--color-add)]", "text-white", "hover:bg-[var(--color-addhover)]", "rounded", "mt-4");
    submitBtn.addEventListener("click", async () => {
        const updatedTask = getTaskDataFromRow(row, 0);
        await modifyTask(task.chore_id, updatedTask);
        renderWeeklyChores();
    });

    // Add cancel button
    const cancelBtn = document.createElement("button");
    cancelBtn.type = "button";
    cancelBtn.textContent = "Cancelar Cambios";
    cancelBtn.classList.add("px-4", "py-2", "bg-[var(--color-delete)]", "text-white", "hover:bg-[var(--color-deletehover)]", "rounded", "mt-4");
    cancelBtn.addEventListener("click", async () => {
        tasksContainer.innerHTML = ""; // Clear tasks container
        modalContent.classList.remove("hidden"); // Show original modal content

    });

    // Append buttons to container
    buttonContainer.appendChild(cancelBtn);
    buttonContainer.appendChild(submitBtn);

    // Append container to tasksContainer
    tasksContainer.appendChild(buttonContainer);
}

function handleDelete(choreId) {
    // abrir ventana para eliminar la tarea
    let deleteTask = confirm("¿Estás seguro de que deseas eliminar esta tarea? \n Esto eliminará la tarea completamente, no solo esta instancia.");
    if (deleteTask) {
        deleteTask(choreId);
    }
}


function getCurrentWeekDates() {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    const mondayOffset = (dayOfWeek + 5) % 7; // Offset to get back to Monday
    // EL OFFSET DE GPT ESTABA MAL, ARA TENGO QUE VER SI EL QUE HICE A MANO SE MANTIENE O HAY QUE USAR OTRO METODO PARA PILLAR DIA Y FECHA

    const monday = new Date(today);
    monday.setDate(today.getDate() - mondayOffset - 1);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    const weekDates = {};
    const dayNames = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

    for (let i = 0; i < 7; i++) {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i + 1);
        weekDates[dayNames[i]] = d.toISOString().split('T')[0]; // yyyy-mm-dd
    }

    return { monday, sunday, weekDates };
}



function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}