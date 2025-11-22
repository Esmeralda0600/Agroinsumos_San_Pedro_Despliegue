// URL de tu API (el backend en Node)
const API_INVENTARIO_URL = "http://localhost:3000/productos/inventario";

// Cuando la página cargue, llamamos a la API
document.addEventListener("DOMContentLoaded", () => {
  cargarInventario();
});

async function cargarInventario() {
  try {
    const resp = await fetch(API_INVENTARIO_URL);

    if (!resp.ok) {
      throw new Error("Error al consultar la API: " + resp.status);
    }

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
      tdIngrediente.innerHTML = `<span>${producto.ingrediente_activo || "-"}</span>`;
      // Marca
      const tdMarca = document.createElement("td");
      tdMarca.innerHTML = `<span>${producto.marca || "-"}</span>`;
      // Descripción
      const tdDescripcion = document.createElement("td");
      tdDescripcion.innerHTML = `<span>${producto.descripcion || "-"}</span>`;
      const tdCantidad = document.createElement("td");
      tdCantidad.innerHTML = `<span>${producto.cantidad ?? "-"}</span>`;
      // Sucursal
      const tdSucursal = document.createElement("td");
      tdSucursal.innerHTML = `<span>${producto.id_sucursal || "-"}</span>`;
      //categoria
      const tdCategoria = document.createElement("td");
      tdCategoria.innerHTML = `<span>${producto.categoria_producto || "-"}</span>`;
      // Botón de acción
      const tdAccion = document.createElement("td");
      const btn = document.createElement("button");
      btn.className = "modificar";
      btn.type = "button";
      btn.textContent = "Modificar";
      btn.onclick = () => {
        // Aquí luego puedes pasar el id_producto por query params
        window.location.href = `modificar.html?id=${producto.id_producto}`;
      };
      tdAccion.appendChild(btn);

      // Agregamos las celdas a la fila
      tr.appendChild(tdNombre);
      tr.appendChild(tdPrecio);
      tr.appendChild(tdIngrediente);
      tr.appendChild(tdMarca);
      tr.appendChild(tdDescripcion);
      tr.appendChild(tdCantidad);
      tr.appendChild(tdSucursal);
      tr.appendChild(tdCategoria);
      tr.appendChild(tdAccion);

      // Agregamos la fila a la tabla
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
    // si el nombre NO contiene lo escrito -> ocultar
    const coincideTexto = nombreTexto.includes(filtroTexto);
    const coincideCategoria =
      filtroCategoria === "todo" || categoriaFila === filtroCategoria;

    if (coincideTexto && coincideCategoria) {
      fila.style.display = "";
    } else {
      fila.style.display = "none";
    }
  }
}

// Flitra lo escrito en la barra de búsqueda
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