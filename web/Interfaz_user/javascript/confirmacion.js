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

// Enviar la info de la compra al backend para registrar la venta
async function registrarVentaEnServidor(mpStatus, paymentId, preferenceId) {
  const usuarioId = localStorage.getItem("usuarioId") || null;
  const itemsStr = localStorage.getItem("pago_items");
  const totalStr = localStorage.getItem("pago_total");
  const metodo = localStorage.getItem("pago_metodo") || "no_especificado";

  let items = [];
  try {
    items = JSON.parse(itemsStr || "[]");
  } catch (e) {
    console.error("Error leyendo pago_items para enviar a servidor:", e);
  }

  if (!items.length) {
    console.warn("No hay items para registrar en la venta.");
    return;
  }

  // Evitar mandar la venta dos veces (por refrescar la página)
  const ventaYaReportada = localStorage.getItem("venta_reportada_mp");
  if (ventaYaReportada === paymentId && paymentId) {
    console.log("Esta venta ya fue registrada anteriormente, no se envía de nuevo.");
    return;
  }

  try {
    const resp = await fetch("https://agroinsumos-san-pedro-despliegue.onrender.com/pagos/confirmar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        usuarioId,
        items,
        total: totalStr,
        metodoPago: metodo,
        mpStatus,
        mpPaymentId: paymentId,
        mpPreferenceId: preferenceId,
      }),
    });

    const data = await resp.json();
    console.log("Respuesta de /pagos/confirmar:", data);

    if (resp.ok) {
      // Guardamos que ya reportamos esta venta
      if (paymentId) {
        localStorage.setItem("venta_reportada_mp", paymentId);
      }
    } else {
      console.warn("No se pudo registrar la venta en la BD:", data);
    }
  } catch (error) {
    console.error("Error al registrar venta en el servidor:", error);
  }
}

// ===============================
// Flujo principal
// ===============================
document.addEventListener("DOMContentLoaded", async () => {
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

  // Si el pago fue aprobado, avisamos al backend para registrar la venta
  if (mpStatus === "approved") {
    await registrarVentaEnServidor(mpStatus, paymentId, preferenceId);
  }
});
