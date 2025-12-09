// js/historial.js
// Llena la tabla de HISTORIAL USUARIOS con las ventas guardadas en la BD

const API_URL = "https://agroinsumos-san-pedro-despliegue-1.onrender.com";

async function cargarHistorial() {
  const tbody = document.getElementById("tbody-historial");
  if (!tbody) return;

  tbody.innerHTML = `
    <tr><td colspan="5">Cargando historial...</td></tr>
  `;

  try {
    const resp = await fetch(`${API_URL}/ventas`);
    const data = await resp.json();

    // Por si el back regresa { ventas: [...] } o directamente [...]
    const ventas = Array.isArray(data) ? data : data.ventas || [];

    tbody.innerHTML = "";

    if (!Array.isArray(ventas) || ventas.length === 0) {
      tbody.innerHTML = `
        <tr><td colspan="5">No hay compras registradas todavía.</td></tr>
      `;
      return;
    }

    // Por cada venta y por cada item de esa venta creamos una fila
    ventas.forEach((venta) => {
      // 👇 Usamos lo que guardaste al confirmar el pago
      const nombreUsuario =
        venta.nombreCliente ||
        (venta.usuarioId && (venta.usuarioId.nombre_usuario || venta.usuarioId.nombre)) ||
        "Usuario sin nombre";

      const correoUsuario =
        venta.correoCliente ||
        (venta.usuarioId && (venta.usuarioId.correo || venta.usuarioId.email)) ||
        "Sin correo";

      (venta.items || []).forEach((item) => {
        const cantidad = Number(item.cantidad || 1);
        const precio = Number(item.precio || 0);
        const monto = cantidad * precio;

        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td><span>${nombreUsuario}</span></td>
          <td><span>${correoUsuario}</span></td>
          <td><span>${item.nombre || "Producto"}</span></td>
          <td><span>${cantidad}</span></td>
          <td><span>$${monto.toFixed(2)}</span></td>
        `;
        tbody.appendChild(tr);
      });
    });
  } catch (error) {
    console.error("Error al cargar historial:", error);
    tbody.innerHTML = `
      <tr><td colspan="5">Error al cargar el historial de compras.</td></tr>
    `;
  }
}

document.addEventListener("DOMContentLoaded", cargarHistorial);
