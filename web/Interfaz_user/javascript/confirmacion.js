// ===============================
// CONFIG
// ===============================

// PON AQUÍ LA URL DE TU API EN RENDER (IMPORTANTE)
const API_URL = "https://agroinsumos-san-pedro-despliegue.onrender.com";



// ===============================
// Utilidades
// ===============================

// Leer parámetros de la URL (ej: ?status=approved&payment_id=123)
function getQueryParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

// Pintar resumen de la compra usando lo que guardamos en localStorage
function mostrarResumenLocal() {
  const listaDiv = document.getElementById("lista-productos");
  const totalSpan = document.getElementById("total-pagado");
  const metodoSpan = document.getElementById("metodo-pago");

  listaDiv.innerHTML = "";

  const itemsStr = localStorage.getItem("pago_items");
  const totalStr = localStorage.getItem("pago_total");
  const metodo = localStorage.getItem("pago_metodo") || "-";

  let items = [];
  try {
    items = JSON.parse(itemsStr || "[]");
  } catch (e) {
    console.error("Error leyendo pago_items:", e);
  }

  if (!items.length) {
    listaDiv.innerHTML = "<p>No se encontraron productos en esta compra.</p>";
  } else {
    items.forEach((item) => {
      const cantidad = Number(item.cantidad || 1);
      const precio = Number(item.precio || 0);
      const subtotal = cantidad * precio;

      const div = document.createElement("div");
      div.classList.add("item-confirmacion");
      div.innerHTML = `
        <p><strong>${item.nombre || "Producto"}</strong></p>
        <p>Cantidad: ${cantidad}</p>
        <p>Precio unitario: $${precio.toFixed(2)}</p>
        <p>Subtotal: $${subtotal.toFixed(2)}</p>
      `;
      listaDiv.appendChild(div);
    });
  }

  if (totalStr) {
    totalSpan.textContent = `$${Number(totalStr).toFixed(2)}`;
  }

  metodoSpan.textContent = metodo;
}


// ===============================
// Registrar venta en el servidor
// ===============================

async function registrarVentaEnServidor({ status, paymentId, preferenceId }) {
  try {
    const usuarioId = localStorage.getItem("usuario_id") || null;
    const items = JSON.parse(localStorage.getItem("pago_items") || "[]");
    const total = Number(localStorage.getItem("pago_total") || 0);
    const metodoPago = localStorage.getItem("pago_metodo") || "-";

    const resp = await fetch(`${API_URL}/pagos/confirmar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        usuarioId,
        items,
        total,
        metodoPago,
        mpStatus: status,          
        mpPaymentId: paymentId,
        mpPreferenceId: preferenceId,
      }),
    });

    const data = await resp.json();

    if (!resp.ok) {
      console.error("Error al registrar venta:", data);
      return; // no actualices el resumen si falló
    }

    // Actualizar el resumen con la info que regresó el backend
    document.getElementById("total-pagado").textContent =
      `$${data.venta.total.toFixed(2)}`;
    document.getElementById("metodo-pago").textContent =
      data.venta.metodoPago || "-";
    document.getElementById("mp-payment-id").textContent =
      data.venta.mpPaymentId || "-";
    document.getElementById("mp-status").textContent =
      data.venta.mpStatus || "-";
    document.getElementById("mp-preference-id").textContent =
      data.venta.mpPreferenceId || "-";

    console.log("Venta registrada correctamente:", data.venta);
  } catch (err) {
    console.error("Error en fetch /pagos/confirmar:", err);
  }
}


// ===============================
// Flujo principal
// ===============================
document.addEventListener("DOMContentLoaded", async () => {
  // Pintar lo que teníamos guardado en localStorage
  mostrarResumenLocal();

  // Leer datos que Mercado Pago manda por query string
  const mpStatus =
    getQueryParam("status") ||
    getQueryParam("collection_status") ||
    "desconocido";

  const paymentId =
    getQueryParam("payment_id") ||
    getQueryParam("collection_id") ||
    null;

  const preferenceId =
    getQueryParam("preference_id") ||
    getQueryParam("preferenceId") ||
    null;

  // Mostrar esos datos en pantalla
  document.getElementById("mp-status").textContent = mpStatus;
  document.getElementById("mp-payment-id").textContent = paymentId || "-";
  document.getElementById("mp-preference-id").textContent = preferenceId || "-";

  const titulo = document.getElementById("titulo-estado");
  const descripcion = document.getElementById("descripcion-estado");

  if (mpStatus === "approved") {
    titulo.textContent = "¡Gracias por tu compra!";
    descripcion.textContent =
      "Tu pago fue aprobado correctamente. En breve procesaremos tu pedido.";
  } else if (mpStatus === "in_process" || mpStatus === "pending") {
    titulo.textContent = " Tu pago está pendiente";
    descripcion.textContent =
      "Mercado Pago todavía está procesando tu pago. Si se aprueba, verás el cambio en tu historial.";
  } else if (mpStatus === "rejected") {
    titulo.textContent = " Tu pago fue rechazado";
    descripcion.textContent =
      "El pago no pudo completarse. Puedes intentar de nuevo con otro medio de pago.";
  } else {
    titulo.textContent = "ℹ Estado del pago desconocido";
    descripcion.textContent =
      "No pudimos determinar el estado del pago. Revisa tu actividad en Mercado Pago o contacta soporte.";
  }

  if (mpStatus === "approved") {
    await registrarVentaEnServidor({
      status: mpStatus,
      paymentId,
      preferenceId,
    });
  }
});
