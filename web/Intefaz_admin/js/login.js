document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("loginForm");

    form.addEventListener("submit", (event) => {
        event.preventDefault();

        const usuario = document.getElementById("administrador").value.trim();
        const contraseña = document.getElementById("contraseña").value.trim();

        console.log("Validando...", usuario, contraseña);

        // const loader = document.getElementById("loader");
        // loader.classList.remove("oculto");

        if (usuario === "administrador" && contraseña === "agroinsumos_spa") {

            showToast("Acceso permitido","success");

            // Guardar sesión en localStorage
            localStorage.setItem("adminAuth", JSON.stringify({
                adminId: "admin-default",
                usuario: "administrador"
            }));

            // loader.classList.add("oculto");
            window.location.href = "principal.html";

        } else {

            showToastrt("Usuario o contraseña incorrectos","error");

        }
    });
});
