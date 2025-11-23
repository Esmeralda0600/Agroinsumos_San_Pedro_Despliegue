document.addEventListener("DOMContentLoaded", () => {
    console.log("[DEBUG] script.js cargado");

    const fotoInput = document.getElementById("foto");
    const preview = document.getElementById("preview");
    const form = document.getElementById("form-producto");

    if (!form) {
        console.error("[ERROR] No se encontró el formulario #form-producto");
        return;
    }

    if (fotoInput && preview) {
        fotoInput.addEventListener("change", () => {
            const archivo = fotoInput.files[0];
            if (archivo) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    preview.src = e.target.result;
                };
                reader.readAsDataURL(archivo);
            } else {
                preview.src = "imgs/agrex_abc.png";
            }
        });
    }

    // ============================
    //   URL API GLOBAL (Render)
    // ============================
    const API_URL = "https://agroinsumos-san-pedro-despliegue.onrender.com";

    // Endpoint final
    const API_CREAR_PRODUCTO_URL = `${API_URL}/productos`;

    //  SUBMIT
    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        console.log("[DEBUG] Submit de alta de producto");

        // Leer valores del formulario
        const nombre = document.getElementById("nombre").value.trim();
        const marca = document.getElementById("marca").value.trim();
        const ingrediente_activo = document.getElementById("ingrediente_activo").value.trim();
        const descripcion = document.getElementById("descripcion").value.trim();
        const sucursal = document.getElementById("sucursal").value.trim();
        const categoria_producto = document.getElementById("categoria")?.value.trim().toUpperCase();

        const precioValor = document.getElementById("precio").value;
        const precio = parseFloat(precioValor);

        const cantidadValor = document.getElementById("cantidad").value;
        const cantidad = parseInt(cantidadValor, 10);

        const archivo = fotoInput?.files[0];

        if (
            !nombre ||
            !marca ||
            !ingrediente_activo ||
            !descripcion ||
            !sucursal ||
            !categoria_producto ||
            isNaN(precio) ||
            isNaN(cantidad)
        ) {
            alert("Por favor llena todos los campos correctamente.");
            return;
        }

        // Generar id único
        const id_producto = `P-${Date.now()}`;

        let direccion_img = "default.png";
        if (archivo) {
            direccion_img = archivo.name;
        }

        const nuevoProducto = {
            id_producto,
            nombre_producto: nombre,
            precio,
            ingrediente_activo,
            marca,
            descripcion,
            cantidad,
            id_sucursal: sucursal,
            direccion_img,
            categoria_producto
        };

        console.log("[DEBUG] Enviando a backend:", nuevoProducto);

        try {
            const resp = await fetch(API_CREAR_PRODUCTO_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(nuevoProducto)
            });

            console.log("[DEBUG] Status respuesta:", resp.status);

            let data = {};
            try {
                data = await resp.json();
            } catch (e) {
                console.warn("[WARN] No se pudo parsear JSON de la respuesta");
            }
            console.log("[DEBUG] Respuesta del servidor:", data);

            if (!resp.ok) {
                alert("Hubo un error al guardar el producto. Revisa la consola.");
                return;
            }

            alert(`El producto "${nombre}" se guardó correctamente.`);
            form.reset();
            if (preview) {
                preview.src = "imgs/agrex_abc.png";
            }

        } catch (error) {
            console.error("[ERROR] Error de red al crear producto:", error);
            alert("No se pudo conectar con el servidor. Verifica que el backend esté activo.");
        }
    });

});
