export function createTaskRow(task = {}, taskNumber = 0) {
    const taskRow = document.createElement("div");
    taskRow.classList.add("task-row", "flex", "flex-wrap", "gap-2", "items-center", "mb-2", "border-b", "pb-2");

    // Create form elements
    const nameInput = createInputElement({
        type: "text",
        name: "task_name",
        placeholder: "Nombre tarea",
        value: task.title || "",
        required: true,
        className: "w-1/4 px-5 py-3 bg-[var(--color-base)] rounded border border-[var(--color-border)]"
    });

    const descInput = createInputElement({
        type: "text",
        name: "task_description",
        placeholder: "Descripción tarea",
        value: task.description || "",
        className: "w-1/3 px-5 py-3 bg-[var(--color-base)] rounded border border-[var(--color-border)]"
    });

    // Type selection
    const typeContainer = document.createElement("div");
    typeContainer.classList.add("flex", "gap-2");

    const occasionalRadio = createRadioElement({
        name: `task_type_${taskNumber}`,
        value: "occasional",
        checked: task.type === "occasional",
        label: "Ocasional"
    });

    const periodicRadio = createRadioElement({
        name: `task_type_${taskNumber}`,
        value: "periodic",
        checked: task.type === "periodic",
        label: "Periódica"
    });

    typeContainer.append(occasionalRadio.container, periodicRadio.container);

    // Date input
    const dateInput = createInputElement({
        type: "date",
        name: "date_limit",
        value: task.date_limit || "",
        className: "border rounded px-2 py-1 text-black hidden"
    });

    // Periodicity options
    const periodicityInput = createPeriodicityInput(taskNumber, task.periodicity, task.specific_days);

    // Remove button
    const removeBtn = createRemoveButton();

    // Append all elements
    taskRow.append(
        nameInput,
        descInput,
        typeContainer,
        dateInput,
        periodicityInput.container,
        removeBtn
    );

    // Setup event listeners
    setupTaskRowEvents(taskRow, taskNumber, periodicityInput);

    return taskRow;
}

// Helper functions
function createInputElement({ type, name, placeholder, value, required, className }) {
    const input = document.createElement("input");
    input.type = type;
    input.name = name;
    if (placeholder) input.placeholder = placeholder;
    if (value) input.value = value;
    if (required) input.required = required;
    if (className) input.className = className;
    return input;
}

function createRadioElement({ name, value, checked, label }) {
    const container = document.createElement("label");
    container.classList.add("flex", "items-center", "gap-2");

    const radio = document.createElement("input");
    radio.type = "radio";
    radio.name = name;
    radio.value = value;
    radio.checked = checked;
    radio.classList.add("ml-1");

    const text = document.createTextNode(label);

    container.append(radio, text);
    return { container, radio };
}

function createPeriodicityInput(taskNumber, selectedPeriodicity, selectedDays = "") {
    const container = document.createElement("div");
    container.classList.add("flex", "flex-col", "gap-1", "hidden");

    const periodicityOptions = ["Diaria", "Mensual", "Anual", "Días Especficos", "Dos veces al día"];
    const radios = [];

    periodicityOptions.forEach(value => {
        const option = createRadioElement({
            name: `task_periodicity_${taskNumber}`,
            value,
            checked: value === selectedPeriodicity,
            label: value
        });
        container.appendChild(option.container);
        radios.push(option.radio);
    });

    // Specific days checkboxes
    const specificDaysWrapper = document.createElement("div");
    specificDaysWrapper.classList.add("flex", "gap-1", "hidden");

    const days = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
    days.forEach(day => {
        const checkbox = createInputElement({
            type: "checkbox",
            name: "task_specific_days",
            value: day,
            checked: selectedDays?.includes(day)
        });

        const label = document.createElement("label");
        label.classList.add("flex", "items-center", "gap-1");
        label.append(checkbox, day);
        specificDaysWrapper.appendChild(label);
    });

    container.appendChild(specificDaysWrapper);

    return {
        container,
        specificDaysWrapper,
        radios  // Return all radio elements
    };
}

function createRemoveButton() {
    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.id = "removeTaskBtn";
    removeBtn.textContent = "✕";
    removeBtn.classList.add("text-[var(--color-delete)]", "m-auto", "text-xl", "hover:bg-[var(--color-delete)]",
        "rounded-full", "w-8", "border", "border-[var(--color-delete)]", "hover:text-white");
    removeBtn.addEventListener("click", (e) => {
        e.target.closest(".task-row").remove();
    });
    return removeBtn;
}

function setupTaskRowEvents(taskRow, taskNumber, periodicityInput) {
    // Get all relevant elements
    const typeRadios = taskRow.querySelectorAll(`input[name="task_type_${taskNumber}"]`);
    const dateInput = taskRow.querySelector(`input[name="date_limit"]`);
    const periodicityContainer = periodicityInput.container;
    
    // Check which type is initially selected
    const initialType = taskRow.querySelector(`input[name="task_type_${taskNumber}"]:checked`)?.value;
    
    // Initialize visibility based on initial type
    if (initialType === "occasional") {
        if (dateInput) dateInput.classList.remove("hidden");
        if (periodicityContainer) periodicityContainer.classList.add("hidden");
    } else {
        if (dateInput) dateInput.classList.add("hidden");
        if (periodicityContainer) periodicityContainer.classList.remove("hidden");
        
        // If periodic, check if we need to show specific days
        const initialPeriodicity = taskRow.querySelector(`input[name="task_periodicity_${taskNumber}"]:checked`)?.value;
        if (initialPeriodicity === "Días Especficos") {
            periodicityInput.specificDaysWrapper.classList.remove("hidden");
        }
    }

    // Set up change handlers
    typeRadios.forEach(radio => {
        radio.addEventListener("change", () => {
            const isOccasional = radio.value === "occasional";
            if (dateInput) dateInput.classList.toggle("hidden", !isOccasional);
            if (periodicityContainer) periodicityContainer.classList.toggle("hidden", isOccasional);
        });
    });

    periodicityInput.radios.forEach(radio => {
        radio.addEventListener("change", () => {
            const showDays = radio.value === "Días Especficos";
            periodicityInput.specificDaysWrapper.classList.toggle("hidden", !showDays);
        });
    });
}

// Function to extract task data from a row
export function getTaskDataFromRow(row, index) {
    const task = {
        title: row.querySelector(`input[name="task_name"]`)?.value.trim() || "",
        description: row.querySelector(`input[name="task_description"]`)?.value.trim() || "",
        type: row.querySelector(`input[name="task_type_${index}"]:checked`)?.value || "periodic"
    };

    if (task.type === "occasional") {
        task.date_limit = row.querySelector(`input[name="date_limit"]`)?.value || null;
    } else {
        task.periodicity = row.querySelector(`input[name="task_periodicity_${index}"]:checked`)?.value || "Diaria";

        if (task.periodicity === "Días Especficos") {
            task.specific_days = Array.from(
                row.querySelectorAll(`input[name="task_specific_days"]:checked`)
            ).map(cb => cb.value);
        }
    }

    return task;
}