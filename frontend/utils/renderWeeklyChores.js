import { fetchGroupTasks, completeTask } from "../assets/fetching.js";
import { group_id, currentUserId } from "../constants/const.js";
// import { addTaskRow } from "./addTaskRow.js";

export async function renderWeeklyChores() {
    const sectionWindow = document.getElementById("sectionWindow");
    if (!sectionWindow) return;

    let tasks = await fetchGroupTasks(group_id);

    console.log(tasks);
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
                    document.getElementById("modifyBtn").onclick = () => handleModify(task.chore_id);
                    document.getElementById("deleteBtn").onclick = () => handleDelete(task.chore_id);
                });
            }

            // Close button
            document.getElementById("closeModal").addEventListener("click", () => {
                document.getElementById("taskModal").classList.add("hidden");
            });


            const { weekStart, weekEnd, byDay: weekDates } = getCurrentWeekDates();
            const daysMap = {
                'Lunes': 'monday',
                'Martes': 'tuesday',
                'Miércoles': 'wednesday',
                'Jueves': 'thursday',
                'Viernes': 'friday',
                'Sábado': 'saturday',
                'Domingo': 'sunday'
            };

            // Inside renderWeeklyChores before looping through tasks:
            Object.entries(weekDates).forEach(([dayKey, dateObj]) => {
                const container = document.getElementById(dayKey);
                if (container) {
                    container.setAttribute("data-date", dateObj.toISOString().split('T')[0]);
                }
            });

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

                        Object.entries(weekDates).forEach(([dayKey, dateObj]) => {
                            const dayContainer = document.getElementById(dayKey);
                            const isoDate = dateObj.toISOString().split('T')[0];

                            if (!completionsMap.has(isoDate)) {
                                const boxClone = box.cloneNode(true);
                                setupTaskClick(boxClone, task);
                                dayContainer?.appendChild(boxClone);
                            }
                        });
                        break;
                    }

                    case "Dos veces al día": {
                        box.classList.add("bg-[--color-twice]", "hover:bg-[var(--color-hovertwice)]");
                        Object.entries(weekDates).forEach(([dayKey, dateObj]) => {
                            const dayContainer = document.getElementById(dayKey);
                            const isoDate = dateObj.toISOString().split('T')[0];
                            const repeats = completionsMap.get(isoDate) || [];

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
                            taskDate.setHours(0, 0, 0, 0);
                            const isoDate = taskDate.toISOString().split('T')[0];

                            if (taskDate >= weekStart && taskDate <= weekEnd && !completionsMap.has(isoDate)) {
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


function handleModify(choreId) {
    // abrir ventana para modificar la tarea

    let change = addTaskRow(choreId); // ABRIMOS EL CREADOR DE ROWS DE TAREAS PERO YA COMPLETADO CON LAS DE LA TAREA EN CUESTION Y DSPS TIRAMOS EL MODIFY
    modifyTask(change);
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
    const day = today.getDay(); // 0 (Sun) to 6 (Sat)
    const mondayOffset = day === 0 ? -6 : 1 - day;

    // Start of week (Monday 00:00:00)
    const weekStart = new Date(today);
    weekStart.setHours(0, 0, 0, 0);
    weekStart.setDate(today.getDate() + mondayOffset);

    // End of week (Sunday 23:59:59)
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    // Optional: map days to exact dates
    const byDay = {};
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    for (let i = 0; i < 7; i++) {
        const date = new Date(weekStart);
        date.setDate(weekStart.getDate() + i);
        byDay[dayNames[i]] = date;
    }

    return { weekStart, weekEnd, byDay };
}


function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}