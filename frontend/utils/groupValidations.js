import { currentUserId } from "../constants/const.js";
import { createGroup } from "../assets/fetching.js";

export async function handleCreateGroupFormSubmit() {
    const groupNameInput = document.getElementById("groupNameInput");
    const groupDescriptionInput = document.getElementById("groupDescriptionInput");
    const groupAddressInput = document.getElementById("address");

    const createGroupError = document.getElementById("createGroupError");

    const name = groupNameInput.value.trim();
    const description = groupDescriptionInput.value.trim();
    const groupAddress = groupAddressInput.value.trim();

    const groupObj = {
        Name: name,
        Description: description,
        Address: groupAddress,
        Creator_ID: currentUserId
    };

    const taskRows = document.querySelectorAll(".task-row");
    const tasks = [];

    [...taskRows].reverse().forEach((row, index) => {
       const task = {};

        task.title = row.querySelector(`input[name="task_name"]`)?.value.trim() || "";
        task.description = row.querySelector(`input[name="task_description"]`)?.value.trim() || "";

        const type = row.querySelector(`input[name="task_type_${index}"]:checked`)?.value;
        task.type = type;

        if (type === "occasional") {
            task.date_limit = row.querySelector(`input[name="date_limit"]`)?.value || null;
            if (task.date_limit < Date.now()) {
                createGroupError.textContent = "La fecha de la tarea ocasional no puede ser anterior a la fecha actual.";
                return;
            }
        } else if (type === "periodic") {
            const periodicity = row.querySelector(`input[name="task_periodicity_${index}"]:checked`)?.value;
            task.periodicity = periodicity;

            if (periodicity === "Días Especficos") {
                const selectedDays = [...row.querySelectorAll(`input[name="task_specific_days"]:checked`)]
                    .map(cb => cb.value);
                task.specific_days = selectedDays;
            }
        }

        tasks.push(task);
    });

    try {
        await createGroup(groupObj, tasks);

    } catch (error) {
        console.error(`${createGroupError}`, error);
        createGroupError.textContent = `${createGroupError}`;
    }
}