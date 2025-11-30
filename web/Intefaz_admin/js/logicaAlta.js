const API_URL = "https://agroinsumos-san-pedro-despliegue-kafy.onrender.com";

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
                preview.src = "imgs/logo.png";
            }
        });
    }

    // ============================
    //   URL API GLOBAL (Render)
    // ============================
    

    // Endpoint final
    const API_CREAR_PRODUCTO_URL = `${API_URL}/productos`;

    //  SUBMIT
    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        console.log("[DEBUG] Submit de alta de producto");
        let rutaImagen = "default.png";

        const fotoInput = document.getElementById("foto");
        const file = fotoInput.files[0];

        let urlImagen = null;

        if (file) {
            urlImagen = await subirImagen(file);
            console.log("Imagen subida:", urlImagen);
        }

        // Ahora puedes mandar el resto de datos del producto
        const payload = {
            nombre: document.getElementById("nombre").value,
            precio: document.getElementById("precio").value,
            descripcion: document.getElementById("descripcion").value,
            imagen: urlImagen, // ← aquí queda la URL final
        };

        const res = await fetch(API_CREAR_PRODUCTO_URL, {
            method: "POST",
            headers: {
            "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        const data = await res.json();
        console.log(data);

        alert("Producto guardado correctamente");

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

        //const archivo = fotoInput?.files[0];

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

        // let direccion_img = "default.png";
        // if (archivo) {
        //     direccion_img = archivo.name;
        // }

        const nuevoProducto = {
            id_producto,
            nombre_producto: nombre,
            precio,
            ingrediente_activo,
            marca,
            descripcion,
            cantidad,
            id_sucursal: sucursal,
            direccion_img:urlImagen,
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
                preview.src = "../imgs/logo.png"; // cambio de la foto por default
            }

        } catch (error) {
            console.error("[ERROR] Error de red al crear producto:", error);
            alert("No se pudo conectar con el servidor. Verifica que el backend esté activo.");
        }
    });

});

async function subirImagen(file) {
    const formData = new FormData();
    formData.append("file", file);
  
    const res = await fetch("https://agroinsumos-san-pedro-despliegue-kafy.onrender.com/administradores/upload", {
      method: "POST",
      body: formData
    });
  
    const data = await res.json();
    return data.url; // ← Cloudinary URL
}
  
