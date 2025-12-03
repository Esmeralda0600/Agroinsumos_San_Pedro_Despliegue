
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const usuario = document.getElementById("administrador").value.trim();
    const contraseña = document.getElementById("contraseña").value.trim();

    if (!usuario || !contraseña) {
      alert("Ingresa usuario y contraseña.");
      return;
    }

    try {
      // 🔹 Usa la URL de tu backend: local o Render
      const resp = await fetch(
        "https://agroinsumos-san-pedro-despliegue.onrender.com/administradores/login",
          //"http://localhost:3000/administradores/login" ,//si pruebas en local
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nombre_admin: usuario,
            contraseña_admin: contraseña,
          }),
        }
      );

      const data = await resp.json();
      console.log("Respuesta login admin:", data);

      if (!resp.ok || !data.ok) {
        alert(data.message || "Usuario o contraseña incorrectos");
        return;
      }

      // Guardar "sesión" en localStorage
      localStorage.setItem(
        "adminAuth",
        JSON.stringify({
          adminId: data.adminId,
          nombre_admin: data.nombre_admin,
          correo_admin: data.correo_admin,
        })
      );

      alert("Acceso permitido");
      window.location.href = "index.html"; // tu panel admin
    } catch (error) {
      console.error("Error al hacer login:", error);
      alert("Error de conexión con el servidor.");
    }
  });
});