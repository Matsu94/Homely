import { registerUser } from "../../assets/fetching.js";

document.getElementById("registerForm").addEventListener("submit", validateRegister);

async function validateRegister(e) {
    e.preventDefault();
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;
    const confirm = document.getElementById("confirmation").value;
    const usernameError = document.getElementById("usernameError");
    const passwordError = document.getElementById("passwordError");
    const confirmationError = document.getElementById("confirmationError");

    const strongPassword = /^(?=.*[0-9])(?=.*[!@#$%^&*]).{8,}$/;

    // Clear previous errors
    usernameError.textContent = "";
    passwordError.textContent = "";
    confirmationError.textContent = "";

    let isValid = true;

    if (username.length < 6) {
        usernameError.textContent = "El nombre de usuario debe tener al menos 6 caracteres.";
        isValid = false;
    }

    if (!strongPassword.test(password)) {
        passwordError.textContent = "La contraseña debe tener al menos 8 caracteres 1 numero y 1 caracter especial.";
        isValid = false;
    }

    if (password !== confirm) {
        confirmationError.textContent = "Las contraseñas no coinciden.";
        isValid = false;
    }

    if (!isValid) return;

    try {
        await registerUser(username, password);
    } catch (err) {
        console.error(err);
        alert("Error al registrar el usuario. Intenta más tarde.");
    }
}
