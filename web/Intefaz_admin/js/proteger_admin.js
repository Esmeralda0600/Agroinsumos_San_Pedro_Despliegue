// js/proteger_admin.js
document.addEventListener("DOMContentLoaded", () => {
  const authStr = localStorage.getItem("adminAuth");

  if (!authStr) {
    alert("Debes iniciar sesión como administrador para acceder.");
    window.location.href = "index.html";
    return;
  }

  try {
    const auth = JSON.parse(authStr);
    if (!auth.adminId) {
      throw new Error("adminId inválido");
    }
  } catch (e) {
    console.error("Error leyendo adminAuth:", e);
    localStorage.removeItem("adminAuth");
    window.location.href = "index.html";
  }
});
