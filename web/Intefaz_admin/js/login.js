
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const usuario = document.getElementById("administrador").value.trim();
    const contraseña = document.getElementById("contraseña").value.trim();

    if (!usuario || !contraseña) {
      showToast("Ingresa usuario y contraseña.");
      return;
    }
    const loader = document.getElementById("loader");
    try {
      
      loader.classList.remove("oculto");
      // 🔹 Usa la URL de tu backend: local o Render
      const resp = await fetch(
        "https://agroinsumos-san-pedro-despliegue.onrender.com/administradores/login",
          //"http://localhost:3000/administradores/login" ,//si pruebas en local
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nombre_admin: usuario,
            contraseña_admin: contraseña
          }),
        }
      );

      const data = await resp.json();
      console.log("Respuesta login admin:", data);

      if (!resp.ok || !data.ok) {
        showToast("Usuario o contraseña incorrectos","error");
        loader.classList.add("oculto");
        return;
      }
      loader.classList.add("oculto");
      // Guardar "sesión" en localStorage
      localStorage.setItem(
        "adminAuth",
        JSON.stringify({
          adminId: data.adminId,
          nombre_admin: data.nombre_admin,
          correo_admin: data.correo_admin,
        })
      );

      showToast("Acceso permitido","success");
      window.location.href = "principal.html"; // tu panel admin
    } catch (error) {
      console.error("Error al hacer login:", error);
      showToast("Error de conexión con el servidor.","error");
      loader.classList.add("oculto");
    }
  });
});