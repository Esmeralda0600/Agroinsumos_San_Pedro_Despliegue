// URL de tu API (backend desplegado en Render)
const API_URL = "https://agroinsumos-san-pedro-despliegue.onrender.com";
const API_INVENTARIO_URL = `${API_URL}/productos/inventario`;

// Cuando la página cargue, llamamos a la API
document.addEventListener("DOMContentLoaded", () => {
  cargarInventario();
});

async function cargarInventario() {
  const loader = document.getElementById("loader");
  loader.classList.remove("oculto");
  try {
    const resp = await fetch(API_INVENTARIO_URL);

    if (!resp.ok) {
      loader.classList.add("oculto");
      throw new Error("Error al consultar la API: " + resp.status);
      
    }
    loader.classList.add("oculto");
    const data = await resp.json();

    // En mostrarInventario regresamos { mensaje, inventario: [...] }
    const productos = data.inventario || [];
    const tbody = document.getElementById("tbody-inventario");
    tbody.innerHTML = ""; // Limpia filas anteriores

    productos.forEach(producto => {
      const tr = document.createElement("tr");
      tr.dataset.categoriaProducto = (producto.categoria_producto || "").toLowerCase();

      // Nombre del producto
      const tdNombre = document.createElement("td");
      tdNombre.innerHTML = `<span>${producto.nombre_producto || "-"}</span>`;

      // Precio
      const tdPrecio = document.createElement("td");
      tdPrecio.innerHTML = `<span>$${producto.precio ?? 0}</span>`;

      // Ingrediente activo
      const tdIngrediente = document.createElement("td");
const ingrediente = (producto.ingrediente_activo || "-").trim();
const palabrasIng = ingrediente.split(/\s+/);
const limiteIng = 2;

if (ingrediente === "-" || palabrasIng.length <= limiteIng) {
  tdIngrediente.innerHTML = `<span>${ingrediente}</span>`;
} else {
  const cortaIng = palabrasIng.slice(0, limiteIng).join(" ");
  const idDetalleIng = "ing_" + producto.id_producto; // ID único

  tdIngrediente.innerHTML = `
    <details id="${idDetalleIng}">
        <summary>
          ${cortaIng}...
          <span class="toggle-ing" style="color:#0f684b; cursor:pointer">Leer más</span>
        </summary>
        <p style="margin-top:5px;">${ingrediente}</p>
    </details>
  `;

  // Cambiar entre "Leer más" y "Leer menos"
  setTimeout(() => {
    const detailsIng = document.getElementById(idDetalleIng);
    const txtIng = detailsIng.querySelector(".toggle-ing");

    detailsIng.addEventListener("toggle", () => {
      txtIng.textContent = detailsIng.open ? "Leer menos" : "Leer más";
    });
  }, 0);
}
      // Marca
      const tdMarca = document.createElement("td");
      tdMarca.innerHTML = `<span>${producto.marca || "-"}</span>`;

      // Descripción
      const tdDescripcion = document.createElement("td");
const descripcion = (producto.descripcion || "-").trim();
const palabras = descripcion.split(/\s+/);
const limite = 6;

if (descripcion === "-" || palabras.length <= limite) {
  tdDescripcion.innerHTML = `<span>${descripcion}</span>`;
} else {
  const corta = palabras.slice(0, limite).join(" ");

  const idDetalle = "desc_" + producto.id_producto; // ID único por producto

  tdDescripcion.innerHTML = `
    <details id="${idDetalle}">
        <summary>
            ${corta}... 
            <span class="toggle-text" style="color:#0f684b; cursor:pointer">Leer más</span>
        </summary>
        <p style="margin-top:5px;">${descripcion}</p>
    </details>
  `;

  // Cambiar "Leer más" <-> "Leer menos"
  setTimeout(() => {
    const details = document.getElementById(idDetalle);
    const txt = details.querySelector(".toggle-text");

    details.addEventListener("toggle", () => {
      txt.textContent = details.open ? "Leer menos" : "Leer más";
    });
  }, 0);
}

      // Cantidad
      const tdCantidad = document.createElement("td");
      tdCantidad.innerHTML = `<span>${producto.cantidad ?? "-"}</span>`;

      // Sucursal
      const tdSucursal = document.createElement("td");
      tdSucursal.innerHTML = `<span>${producto.id_sucursal || "-"}</span>`;

      // Categoría
      const tdCategoria = document.createElement("td");
      tdCategoria.innerHTML = `<span>${producto.categoria_producto || "-"}</span>`;

      // Acción selector
      const tdAccion = document.createElement("td");

// Crear el <select>
const selectAccion = document.createElement("select");
selectAccion.className = "select-accion";

// Opción por defecto
const optDefault = document.createElement("option");
optDefault.value = "";
optDefault.textContent = "-";

// Opción MODIFICAR
const optModificar = document.createElement("option");
optModificar.value = "modificar";
optModificar.textContent = "Modificar";

// Opción ELIMINAR
const optEliminar = document.createElement("option");
optEliminar.value = "eliminar";
optEliminar.textContent = "Eliminar";

// Agregar opciones al select
selectAccion.appendChild(optDefault);
selectAccion.appendChild(optModificar);
selectAccion.appendChild(optEliminar);

// Manejar cambio
selectAccion.addEventListener("change", () => {
  const value = selectAccion.value;

  if (value === "modificar") {
    // Ir a la pantalla de modificar
    window.location.href = `modificar.html?id=${producto.id_producto}`;
  }

  if (value === "eliminar") {
     window.location.href = `baja2.html?id=${producto.id_producto}`;
  }

  // Regresar el select a "Acción"
  selectAccion.value = "";
});

// Agregar el select a la celda
tdAccion.appendChild(selectAccion);

      tr.appendChild(tdNombre);
      tr.appendChild(tdPrecio);
      tr.appendChild(tdIngrediente);
      tr.appendChild(tdMarca);
      tr.appendChild(tdDescripcion);
      tr.appendChild(tdCantidad);
      tr.appendChild(tdSucursal);
      tr.appendChild(tdCategoria);
      tr.appendChild(tdAccion);

      tbody.appendChild(tr);
    });

    if (typeof filtrarTabla === "function") {
      filtrarTabla();
    }

  } catch (error) {
    console.error("Error al cargar inventario:", error);
    alert("No se pudo cargar el inventario. Revisa la consola.");
  }
}

function filtrarTabla() {
  const inputBuscar = document.getElementById("buscar");
  const selectCategoria = document.getElementById("categoria");
  const filtroTexto = (inputBuscar?.value || "").toLowerCase();
  const filtroCategoria = (selectCategoria?.value || "todo").toLowerCase();

  const tbody = document.getElementById("tbody-inventario");
  const filas = tbody.getElementsByTagName("tr");

  for (let i = 0; i < filas.length; i++) {
    const fila = filas[i];

    // Nombre del producto
    const tdNombre = fila.getElementsByTagName("td")[0];
    const nombreTexto = tdNombre ? tdNombre.innerText.toLowerCase() : "";

    // Categoría de la fila
    const categoriaFila =
      (fila.dataset.categoriaProducto || fila.getElementsByTagName("td")[7]?.innerText || "")
        .toLowerCase();

    // Si coincide texto + categoría
    const coincideTexto = nombreTexto.includes(filtroTexto);
    const coincideCategoria =
      filtroCategoria === "todo" || categoriaFila === filtroCategoria;

    fila.style.display = (coincideTexto && coincideCategoria) ? "" : "none";
  }
}

// Filtrar en tiempo real
document.addEventListener("DOMContentLoaded", () => {
  const inputBuscar = document.getElementById("buscar");
  const selectCategoria = document.getElementById("categoria");

  if (inputBuscar) {
    inputBuscar.addEventListener("keyup", filtrarTabla);
  }
  if (selectCategoria) {
    selectCategoria.addEventListener("change", filtrarTabla);
  }
});
