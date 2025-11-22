const API_PRODUCTOS_BASE = "http://localhost:3000/productos";

let cantidadActual = 0;
let precioActual = 0;
let idProducto = null;

document.addEventListener("DOMContentLoaded", async () => {
    console.log("[DEBUG] modificar.js cargado");

    // 1) Leer id de la URL: modificar.html?id=P-...
    const params = new URLSearchParams(window.location.search);
    idProducto = params.get("id");

    if (!idProducto) {
        alert("No se recibió el id del producto en la URL.");
        return;
    }

    // Referencias a elementos del DOM
    const inputCantidad = document.getElementById("nuevaCantidad");
    const resultado = document.getElementById("resultado");
    const cantidadActualEl = document.getElementById("cantidadActual");
    const nombreProductoEl = document.getElementById("nombreProducto");
    const imgProductoEl = document.getElementById("imgProducto");
    const precioActualEl = document.getElementById("precioActual");
    const nuevoPrecioInput = document.getElementById("nuevoPrecio");

    try {
        const resp = await fetch(`${API_PRODUCTOS_BASE}/${encodeURIComponent(idProducto)}`);

        if (!resp.ok) {
            console.error("[ERROR] al obtener producto:", resp.status);
            alert("No se pudo cargar la información del producto.");
            return;
        }

        const data = await resp.json();
        console.log("[DEBUG] Producto cargado:", data);

        const producto = data.producto;

        cantidadActual = producto.cantidad ?? 0;
        precioActual = producto.precio ?? 0;

        nombreProductoEl.textContent = producto.nombre_producto || "Producto";
        cantidadActualEl.textContent = cantidadActual;
        resultado.textContent = cantidadActual;

        precioActualEl.textContent = `$${precioActual.toFixed(2)}`;
        nuevoPrecioInput.value = precioActual.toFixed(2);

        if (producto.imagen) {
            // las imagenes deben de estar en /web/Intefaz_admin/imgs/
            imgProductoEl.src = `imgs/${producto.direccion_img}`;
        } else {
            imgProductoEl.src = "imgs/agrex_abc.png";
        }

    } catch (error) {
        console.error("[ERROR] Error de red al obtener producto:", error);
        alert("No se pudo conectar con el servidor para obtener el producto.");
        return;
    }

    // 3) Botones + y - para campo de cantidad a modificar
    document.querySelector(".btn-mas").onclick = () => {
        const valor = Number(inputCantidad.value) || 0;
        inputCantidad.value = valor + 1;
    };

    document.querySelector(".btn-menos").onclick = () => {
        const valor = Number(inputCantidad.value) || 0;
        if (valor > 0) {
            inputCantidad.value = valor - 1;
        }
    };

    document.querySelector(".aumentar").onclick = () => {
        const ajuste = Number(inputCantidad.value) || 0;
        const nuevo = cantidadActual + ajuste;
        resultado.textContent = nuevo;
    };

    document.querySelector(".disminuir").onclick = () => {
        const ajuste = Number(inputCantidad.value) || 0;
        let nuevo = cantidadActual - ajuste;
        if (nuevo < 0) nuevo = 0;
        resultado.textContent = nuevo;
    };

    document.querySelector(".guardar").onclick = async () => {
        const cantidadFinal = Number(resultado.textContent);
        if (isNaN(cantidadFinal) || cantidadFinal < 0) {
            alert("La cantidad resultante no es válida.");
            return;
        }

        let nuevoPrecio = nuevoPrecioInput.value.trim();
        if (nuevoPrecio === "") {
            nuevoPrecio = precioActual;
        } else {
            nuevoPrecio = parseFloat(nuevoPrecio);
        }

        if (isNaN(nuevoPrecio) || nuevoPrecio < 0) {
            alert("El precio ingresado no es válido.");
            return;
        }

        const body = {
            cantidad: cantidadFinal,
            precio: nuevoPrecio
        };

        console.log("[DEBUG] Enviando actualización:", body);

        try {
            const resp = await fetch(`${API_PRODUCTOS_BASE}/${encodeURIComponent(idProducto)}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(body)
            });

            if (!resp.ok) {
                const errData = await resp.json().catch(() => ({}));
                console.error("[ERROR] al actualizar:", errData);
                alert("Ocurrió un error al guardar los cambios.");
                return;
            }

            const data = await resp.json();
            console.log("[DEBUG] Producto actualizado:", data);

            alert("Cambios guardados correctamente.");
            window.location.href = "inventario.html";

        } catch (error) {
            console.error("[ERROR] Error de red al actualizar producto:", error);
            alert("No se pudo conectar con el servidor para guardar los cambios.");
        }
    };
});