document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("loginForm");

    form.addEventListener("submit", (event) => {
        event.preventDefault();

        const usuario = document.getElementById("administrador").value.trim();
        const contraseña = document.getElementById("contraseña").value.trim();

        console.log("Validando...", usuario, contraseña); // comprobación

        if (usuario === "administrador" && contraseña === "agroinsumos_spa") {
            alert("Acceso permitido");
            window.location.href = "principal.html";
        } else {
            alert("Usuario o contraseña incorrectos");
        }
    });
});
