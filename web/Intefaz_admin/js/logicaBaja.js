const API_BUSCAR_PRODUCTO = "http://localhost:3000/productos/buscar";
const API_PRODUCTOS_BASE = "http://localhost:3000/productos";

document.addEventListener("DOMContentLoaded", () => {
  console.log("[DEBUG] logicaBaja.js cargado");

  const datosProducto = document.getElementById("datosProducto");
  const preview = document.getElementById("preview");
  const buscarInput = document.getElementById("buscar");
  const btnBuscar = document.getElementById("btnBuscar");
  const formBaja = document.getElementById("form-baja");

  const inputIdProducto = document.getElementById("id_producto");
  const inputNombre = document.getElementById("nombre");
  const inputCategoria = document.getElementById("categoria");
  const inputDescripcion = document.getElementById("descripcion");
  const inputPrecio = document.getElementById("precio");

  //  Buscar
  btnBuscar.addEventListener("click", async () => {
    const valor = buscarInput.value.trim();

    if (!valor) {
      alert("Ingresa el nombre o id del producto a buscar.");
      return;
    }

    // Si parece un id (empieza con P-), buscamos por id_producto
    let url = "";
    if (valor.startsWith("P-")) {
      url = `${API_BUSCAR_PRODUCTO}?id_producto=${encodeURIComponent(valor)}`;
    } else {
      url = `${API_BUSCAR_PRODUCTO}?nombre=${encodeURIComponent(valor)}`;
    }

    console.log("[DEBUG] URL de búsqueda:", url);

    try {
      const resp = await fetch(url);

      if (resp.status === 404) {
        alert("Producto no encontrado.");
        datosProducto.classList.add("d-none");
        preview.classList.add("d-none");
        return;
      }

      if (!resp.ok) {
        alert("Error al buscar el producto. Revisa la consola.");
        console.error("[ERROR] Status búsqueda:", resp.status);
        return;
      }

      const data = await resp.json();
      console.log("[DEBUG] Producto encontrado:", data);

      const producto = data.producto;

      inputIdProducto.value = producto.id_producto || "";
      inputNombre.value = producto.nombre_producto || "";
      inputCategoria.value = producto.categoria_producto || "-";
      inputDescripcion.value = producto.descripcion || "";
      inputPrecio.value = producto.precio ?? 0;

      if (producto.imagen) {
        preview.src = `imgs/${producto.imagen}`;
      } else {
        preview.src = "imgs/agrex_abc.png";
      }

      preview.classList.remove("d-none");
      datosProducto.classList.remove("d-none");

    } catch (error) {
      console.error("Error al buscar producto:", error);
      alert("No se pudo conectar con el servidor para buscar el producto.");
    }
  });

  // Eliminar
  formBaja.addEventListener("submit", async (e) => {
    e.preventDefault();

    const idProducto = inputIdProducto.value;
    const nombre = inputNombre.value;

    if (!idProducto) {
      alert("No hay producto cargado para eliminar.");
      return;
    }

    if (!confirm(`¿Seguro que deseas eliminar el producto "${nombre}" del inventario?`)) {
      return;
    }

    try {
      const resp = await fetch(`${API_PRODUCTOS_BASE}/${encodeURIComponent(idProducto)}`, {
        method: "DELETE"
      });

      if (!resp.ok) {
        const dataErr = await resp.json().catch(() => ({}));
        console.error("[ERROR] al eliminar:", dataErr);
        alert("Hubo un problema al eliminar el producto. Revisa la consola.");
        return;
      }

      const data = await resp.json();
      console.log("[DEBUG] Respuesta eliminación:", data);

      alert(`✅ El producto "${nombre}" se eliminó correctamente.`);

      formBaja.reset();
      datosProducto.classList.add("d-none");
      preview.classList.add("d-none");

    } catch (error) {
      console.error("[ERROR] Error de red al eliminar producto:", error);
      alert("No se pudo conectar con el servidor para eliminar el producto.");
    }
  });
});