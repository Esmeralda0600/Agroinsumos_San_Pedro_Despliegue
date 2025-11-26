// 1) Obtener items para el pago (compra directa o carrito)
function obtenerItemsParaPago() {
  const usuarioId = localStorage.getItem("usuarioId");

  if (!usuarioId) {
    alert("Debes iniciar sesión para ver tu carrito.");
    window.location.href = "login.html";
    return { items: [], esCompraDirecta: false };
  }

  const modo = localStorage.getItem("modo_compra") || "carrito"; // 'directa' o 'carrito'

  const claveCarrito = `carrito_${usuarioId}`;
  const carrito = JSON.parse(localStorage.getItem(claveCarrito) || "[]");

  let compraDirecta = [];
  const compraDirectaStr = localStorage.getItem("compra_directa");
  if (compraDirectaStr) {
    try {
      compraDirecta = JSON.parse(compraDirectaStr) || [];
    } catch (e) {
      console.error("Error leyendo compra_directa:", e);
      compraDirecta = [];
    }
  }

  // Caso 1: Modo compra directa → usar SOLO compra_directa
  if (modo === "directa") {
    if (Array.isArray(compraDirecta) && compraDirecta.length > 0) {
      return { items: compraDirecta, esCompraDirecta: true };
    }
    // fallback: si por alguna razón no hay compra_directa, usar carrito
    if (Array.isArray(carrito) && carrito.length > 0) {
      return { items: carrito, esCompraDirecta: false };
    }
    return { items: [], esCompraDirecta: true };
  }

  // Caso 2: Modo carrito (o default)
  if (Array.isArray(carrito) && carrito.length > 0) {
    return { items: carrito, esCompraDirecta: false };
  }

  // Si carrito está vacío pero hay compra directa, úsala
  if (Array.isArray(compraDirecta) && compraDirecta.length > 0) {
    return { items: compraDirecta, esCompraDirecta: true };
  }

  // Nada que pagar
  return { items: [], esCompraDirecta: false };
}

// 2) Pintar el resumen de compra en la página de pago
function renderizarResumenPago() {
  const contenedorLista = document.getElementById("lista-carrito");
  const totalSpan = document.getElementById("total");

  if (!contenedorLista || !totalSpan) {
    console.warn("No se encontraron contenedores de resumen de pago (lista-carrito o total).");
    return;
  }

  contenedorLista.innerHTML = "";

  const { items, esCompraDirecta } = obtenerItemsParaPago();

  if (!items.length) {
    contenedorLista.innerHTML = `
      <p>No hay productos para pagar 🛒</p>
    `;
    totalSpan.textContent = "$0.00";
    return;
  }

  let total = 0;

  items.forEach((item) => {
    const cantidad = Number(item.cantidad || 1);
    const precio = Number(item.precio || 0);
    const subtotal = cantidad * precio;
    total += subtotal;

    const itemDiv = document.createElement("div");
    itemDiv.classList.add("resumen-item");

    const imagenHtml = item.imagen
      ? `<img src="${item.imagen}" alt="${item.nombre || "Producto"}">`
      : "";

    itemDiv.innerHTML = `
      ${imagenHtml}
      <div class="resumen-info">
        <p class="producto-nombre">${item.nombre || "Producto sin nombre"}</p>
        <p>Cantidad: <strong>${cantidad}</strong></p>
        <p>Precio unitario: <strong>$${precio.toFixed(2)}</strong></p>
        <p>Subtotal: <strong>$${subtotal.toFixed(2)}</strong></p>
      </div>
    `;

    contenedorLista.appendChild(itemDiv);
  });

  totalSpan.textContent = "$" + total.toFixed(2);
  console.log("Modo de compra:", esCompraDirecta ? "COMPRA DIRECTA" : "CARRITO COMPLETO");
}

// 3) Llamar a tu API para crear la preferencia de Mercado Pago
async function finalizarCompra() {
  const { items, esCompraDirecta } = obtenerItemsParaPago();

  if (!items.length) {
    alert("No hay productos para pagar.");
    return;
  }

  const totalSpan = document.getElementById("total");
  const totalTexto = totalSpan ? totalSpan.textContent.replace("$", "") : "0";
  const total = Number(totalTexto) || 0;

  const metodoPagoSeleccionado = document.querySelector('input[name="pago"]:checked');
  const metodoPago = metodoPagoSeleccionado ? metodoPagoSeleccionado.value : "desconocido";

  const emailCliente = localStorage.getItem("correo") || "test_user@test.com";

  try {
    const resp = await fetch("https://agroinsumos-san-pedro-despliegue.onrender.com/pagos/crear-preferencia", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items,
        email: emailCliente,
        metodoPago,
        esCompraDirecta,
      }),
    });

    const data = await resp.json();

    if (!resp.ok) {
      console.error("Error al crear preferencia:", data);
      alert("Hubo un error al crear el pago. Intenta más tarde.");
      return;
    }

    // Guardamos info del pago por si la quieres usar luego
    localStorage.setItem("pago_items", JSON.stringify(items));
    localStorage.setItem("pago_total", total.toFixed(2));
    localStorage.setItem("pago_metodo", metodoPago);

    // Limpiamos banderas de compra directa
    localStorage.removeItem("compra_directa");
    localStorage.removeItem("modo_compra");

    // const urlCheckout = data.sandbox_init_point || data.init_point;

    // if (!urlCheckout) {
    //   alert("No se recibió URL de pago desde Mercado Pago.");
    //   return;
    // }

    // // Redirigimos al checkout de Mercado Pago
    // window.location.href = urlCheckout;
        let urlCheckout;
    if (data.env === "sandbox") {
      // Backend está usando TEST-... → sandbox_init_point
      urlCheckout = data.sandbox_init_point || data.init_point;
    } else {
      // Backend está usando APP_USR-... → producción
      urlCheckout = data.init_point || data.sandbox_init_point;
    }

    if (!urlCheckout) {
      alert("No se recibió URL de pago desde Mercado Pago.");
      console.error("Respuesta de MP sin URL:", data);
      return;
    }

    // Redirigimos al checkout de Mercado Pago
    window.location.href = urlCheckout;


  } catch (err) {
    console.error("Error de red al crear el pago:", err);
    alert("Error conectando con el servidor de pagos.");
  }
}

// 4) Al cargar la página, pintamos el resumen
document.addEventListener("DOMContentLoaded", () => {
  renderizarResumenPago();
});
