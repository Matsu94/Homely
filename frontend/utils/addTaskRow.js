
// export function addTaskRow(taskNumber = 0, task = {}) {
//     const tasksContainer = document.getElementById("tasksContainer");

//     const taskRow = document.createElement("div");
//     taskRow.classList.add("task-row", "flex", "flex-wrap", "gap-2", "items-center", "mb-2", "border-b", "pb-2");

//     // Name input
//     const nameInput = document.createElement("input");
//     nameInput.type = "text";
//     nameInput.name = `task_name`;
//     nameInput.placeholder = "Nombre tarea";
//     nameInput.required = true;
//     nameInput.className = "w-1/4 px-5 py-3 bg-[var(--color-base)] rounded border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--color-headers)] text-black";

//     // Description input
//     const descInput = document.createElement("input");
//     descInput.type = "text";
//     descInput.name = `task_description`;
//     descInput.placeholder = "Descripción tarea";
//     descInput.className = "w-1/3 px-5 py-3 bg-[var(--color-base)] rounded border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--color-headers)] text-black";

//     // Type select
//     const typeContainer = document.createElement("div");
//     typeContainer.classList.add("flex", "gap-2");

//     // Occasional
//     const occasionalRadio = document.createElement("input");
//     occasionalRadio.classList.add("ml-1");
//     occasionalRadio.type = "radio";
//     occasionalRadio.name = `task_type_${taskNumber}`;
//     occasionalRadio.value = "occasional";
//     occasionalRadio.required = true;

//     const occasionalLabel = document.createElement("label");
//     occasionalLabel.textContent = "Ocasional";
//     occasionalLabel.appendChild(occasionalRadio);

//     // Periodic
//     const periodicRadio = document.createElement("input");
//     periodicRadio.classList.add("ml-1");
//     periodicRadio.type = "radio";
//     periodicRadio.name = `task_type_${taskNumber}`;
//     periodicRadio.value = "periodic";

//     const periodicLabel = document.createElement("label");
//     periodicLabel.textContent = "Periodica";
//     periodicLabel.appendChild(periodicRadio);

//     // Append both to container
//     typeContainer.appendChild(occasionalLabel);
//     typeContainer.appendChild(periodicLabel);

//     // Date input (hidden by default)
//     const dateInput = document.createElement("input");
//     dateInput.type = "date";
//     dateInput.name = `task_date_${taskNumber}`;
//     dateInput.classList.add("border", "rounded", "px-2", "py-1", "text-black", "hidden");

//     // Periodicity select (hidden by default)
//     const periodicityInput = document.createElement("div");
//     periodicityInput.classList.add("flex", "flex-col", "gap-1", "hidden");
    
//     const periodicityOptions = ["Diaria", "Mensual", "Anual", "Días Especficos", "Dos veces al día"];
    
//     for (const value of periodicityOptions) {
//       const label = document.createElement("label");
//       label.classList.add("flex", "items-center", "gap-2");
    
//       const radio = document.createElement("input");
//       radio.type = "radio";
//       radio.name = `task_periodicity_${taskNumber}`;
//       radio.value = value;
    
//       label.appendChild(radio);
//       label.append(value);
//       periodicityInput.appendChild(label);
//     }

  
//     // Specific days select (hidden by default)
//     const specificDaysWrapper = document.createElement("div");
//     specificDaysWrapper.classList.add("flex", "gap-1", "hidden");
    
//     const days = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
//     for (const day of days) {
//       const label = document.createElement("label");
//       const checkbox = document.createElement("input");
//       label.classList.add("flex", "items-center", "gap-2");
//       checkbox.type = "checkbox";
//       checkbox.name = `task_specific_days`;
//       checkbox.value = day;

//       label.appendChild(checkbox);
//       label.append(day);
//       specificDaysWrapper.appendChild(label);
//     }
//     periodicityInput.appendChild(specificDaysWrapper);
    
//     // Remove button
//     const removeBtn = document.createElement("button");
//     removeBtn.type = "button";
//     removeBtn.textContent = "✕";
//     removeBtn.classList.add("text-[var(--color-delete)]", "m-auto", "text-xl", "hover:bg-[var(--color-delete)]", "rounded-full", "w-8", "border", "border-[var(--color-delete)]", "hover:text-white");
//     removeBtn.addEventListener("click", () => taskRow.remove());

//     // Change behavior
//     typeContainer.addEventListener("change", () => {
//       const isOccasional = occasionalRadio.checked;
//       const isPeriodic = periodicRadio.checked;
    
//       dateInput.classList.toggle("hidden", !isOccasional);
//       periodicityInput.classList.toggle("hidden", !isPeriodic);
//     });

    
//     periodicityInput.addEventListener("change", () => {
//       const selected = periodicityInput.querySelector(`input[name="task_periodicity_${taskNumber}"]:checked`);
//       const isSpecificDays = selected && selected.value === "Días Especficos";
    
//       specificDaysWrapper.classList.toggle("hidden", !isSpecificDays);
//     });
    

//     // Append elements
//     taskRow.appendChild(nameInput);
//     taskRow.appendChild(descInput);
//     taskRow.appendChild(typeContainer);
//     taskRow.appendChild(dateInput);
//     taskRow.appendChild(periodicityInput);
//     taskRow.appendChild(specificDaysWrapper);
//     taskRow.appendChild(removeBtn);

//     tasksContainer.prepend(taskRow); // Add on top of existing tasks (before the button)
//   }


//   const addTaskBtn = document.getElementById("addTaskBtn");

//   addTaskBtn.addEventListener("click", (e) => {
//     e.preventDefault();
//     addTaskRow(taskNumber);         // add the row
//     taskNumber++;                   // increment the task number
//   });