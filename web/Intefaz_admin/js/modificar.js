const API_URL = "https://agroinsumos-san-pedro-despliegue.onrender.com";
const API_PRODUCTOS_BASE = `${API_URL}/productos`;

let cantidadActual = 0;
let precioActual = 0;
let idProducto = null;

document.addEventListener("DOMContentLoaded", async () => {
    console.log("[DEBUG] modificar.js cargado");

    // 1) Leer id de la URL: modificar.html?id=P-...
    const params = new URLSearchParams(window.location.search);
    idProducto = params.get("id");

    if (!idProducto) {
        showToast("No se recibió el id del producto en la URL.","error");
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
            showToast("No se pudo cargar la información del producto.","error");
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

        if (producto.direccion_img.startsWith("http")) {
            imgProductoEl.src = producto.direccion_img;
        } else {
            imgProductoEl.src = "../" + producto.direccion_img;
        }

    } catch (error) {
        console.error("[ERROR] Error de red al obtener producto:", error);
        showToast("No se pudo conectar con el servidor para obtener el producto.","error");
        return;
    }

    // 3) Botones + y - para campo de cantidad
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

    // Guardar cambios
    document.querySelector(".guardar").onclick = async () => {
        const cantidadFinal = Number(resultado.textContent);
        if (isNaN(cantidadFinal) || cantidadFinal < 0) {
            showToast("La cantidad resultante no es válida.","error");
            return;
        }

        let nuevoPrecio = nuevoPrecioInput.value.trim();
        if (nuevoPrecio === "") {
            nuevoPrecio = precioActual;
        } else {
            nuevoPrecio = parseFloat(nuevoPrecio);
        }

        if (isNaN(nuevoPrecio) || nuevoPrecio < 0) {
            showToast("El precio ingresado no es válido.","error");
            return;
        }

        const body = {
            cantidad: cantidadFinal,
            precio: nuevoPrecio
        };

        console.log("[DEBUG] Enviando actualización:", body);

        try {
            const loader = document.getElementById("loader");
            loader.classList.remove("oculto");

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
                loader.classList.add("oculto");
                showToast("Ocurrió un error al guardar los cambios.","error");
                return;
            }

            loader.classList.add("oculto");

            const data = await resp.json();
            console.log("[DEBUG] Producto actualizado:", data);

            showToast("Cambios guardados correctamente.","success");
            window.location.href = "inventario.html";

        } catch (error) {
            console.error("[ERROR] Error de red al actualizar producto:", error);
            loader.classList.add("oculto");
            showToast("No se pudo conectar con el servidor para guardar los cambios.","error");
        }
    };
});
