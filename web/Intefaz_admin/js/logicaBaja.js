const API_URL = "https://agroinsumos-san-pedro-despliegue.onrender.com";
const API_BUSCAR_PRODUCTO = `${API_URL}/productos/buscar`;
const API_PRODUCTOS_BASE = `${API_URL}/productos`;

// Función para leer parámetros de la URL: ?id=P-001
function getQueryParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

document.addEventListener("DOMContentLoaded", async () => {
  console.log("[DEBUG] logicaBaja.js cargado");

  const datosProducto = document.getElementById("datosProducto");
  const preview = document.getElementById("preview");
  const formBaja = document.getElementById("form-baja");

  const inputIdProducto = document.getElementById("id_producto");
  const inputNombre = document.getElementById("nombre");
  const inputCategoria = document.getElementById("categoria");
  const inputDescripcion = document.getElementById("descripcion");
  const inputPrecio = document.getElementById("precio");

  // ==========================
  // 1) Leer id=? de la URL
  // ==========================
  const idDesdeURL = getQueryParam("id");
  console.log("[DEBUG] idDesdeURL:", idDesdeURL);

  if (!idDesdeURL) {
    alert("No se recibió ningún producto para dar de baja.");
    // Si quieres, mandas de regreso al inventario:
    // window.location.href = "inventario.html";
    return;
  }

  // ==========================
  // 2) Cargar producto automáticamente por ID
  // ==========================
  try {
    const url = `${API_BUSCAR_PRODUCTO}?id_producto=${encodeURIComponent(idDesdeURL)}`;
    console.log("[DEBUG] URL auto-búsqueda por ID:", url);

    const resp = await fetch(url);

    if (!resp.ok) {
      if (resp.status === 404) {
        alert("El producto a eliminar no fue encontrado.");
      } else {
        alert("Error al cargar el producto. Revisa la consola.");
        console.error("[ERROR] Status búsqueda:", resp.status);
      }
      return;
    }

    const data = await resp.json();
    console.log("[DEBUG] Producto auto-cargado por ID:", data);

    const producto = data.producto;

    // Rellenar campos
    inputIdProducto.value = producto.id_producto || "";
    inputNombre.value = producto.nombre_producto || "";
    inputCategoria.value = producto.categoria_producto || "-";
    inputDescripcion.value = producto.descripcion || "";
    inputPrecio.value = producto.precio ?? 0;

    if (producto.imagen) {
      // O ajusta esta ruta según cómo guardes la imagen
      preview.src = `imgs/${producto.imagen}`;
    } else {
      preview.src = "imgs/agrex_abc.png";
    }

    preview.classList.remove("d-none");
    datosProducto.classList.remove("d-none");
  } catch (error) {
    console.error("[ERROR] Error al cargar producto por ID:", error);
    alert("No se pudo conectar con el servidor para cargar el producto.");
    return;
  }

  // ==========================
  // 3) Eliminar producto (submit del formulario)
  // ==========================
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

      // Si quieres, lo mandas de regreso al inventario:
      // window.location.href = "inventario.html";
    } catch (error) {
      console.error("[ERROR] Error de red al eliminar producto:", error);
      alert("No se pudo conectar con el servidor para eliminar el producto.");
    }
  });
});
