document.addEventListener("DOMContentLoaded", () => {
    const usuario = localStorage.getItem("usuario");

    const btnLogin = document.getElementById("btn-login");
    const btnRegister = document.getElementById("btn-register");
    const btnUser = document.getElementById("btn-user");
    const btnLogout = document.getElementById("btn-logout");

    // Usuario inició sesión
    if (usuario) {
        if (btnLogin) btnLogin.style.display = "none";
        if (btnRegister) btnRegister.style.display = "none";
        if (btnUser) btnUser.style.display = "inline-block";
        if (btnLogout) btnLogout.style.display = "inline-block";
    } else {
        if (btnLogin) btnLogin.style.display = "inline-block";
        if (btnRegister) btnRegister.style.display = "inline-block";
        if (btnUser) btnUser.style.display = "none";
        if (btnLogout) btnLogout.style.display = "none";
    }

    // Cerrar sesión
    if (btnLogout) {
        btnLogout.addEventListener("click", () => {
            localStorage.removeItem("usuario");
            localStorage.removeItem("usuarioId");
            window.location.href = "login.html";
        });
    }
});
