// ===========================
// FUNCIÓN GLOBAL: AGREGAR AL CARRITO
// ===========================
function agregarAlCarrito(prod) {
    let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

    const existe = carrito.find(p => p.id_producto === prod.id_producto);

    if (existe) {
        existe.cantidad += 1;
    } else {
        carrito.push({
            id_producto: prod.id_producto,
            nombre: prod.nombre_producto,
            precio: prod.precio,
            cantidad: 1,
            imagen: prod.direccion_img || "../imgs/ingrediente.png"
        });
    }

    localStorage.setItem("carrito", JSON.stringify(carrito));
    alert("Producto agregado al carrito 🛒");
    window.location.href = "carrito.html";
}

const API_URL = "https://agroinsumos-san-pedro-despliegue.onrender.com";

function descripcion_producto() {

    document.addEventListener("DOMContentLoaded", () => {

        const producto = JSON.parse(localStorage.getItem("productoSeleccionado"));

        const div_general = document.getElementById("productos");
        div_general.classList.add("producto-detalle");
        div_general.innerHTML = "";

        const div_imagen = document.createElement("div");
        div_imagen.classList.add("tarjeta-producto");

        const img_producto = document.createElement("img");
        img_producto.src = producto.direccion_img || "../imgs/ingrediente.png";

        const nombre = document.createElement("h3");

        const div_info = document.createElement("div");
        div_info.classList.add("info-producto");

        const p_descripcion = document.createElement("p");
        const p_categoria = document.createElement("p");
        const p_ingrediente = document.createElement("p");
        const p_cantidad_disponible = document.createElement("p");
        const p_precio = document.createElement("p");

        const div_acciones = document.createElement("div");
        div_acciones.classList.add("acciones-producto");

        const div_botones = document.createElement("div");
        div_botones.classList.add("botones-acciones");

        const btn_carrito = document.createElement("button");
        btn_carrito.innerText = "Agregar al carrito";
        btn_carrito.classList.add("btn");
        btn_carrito.addEventListener("click", () => {
            agregarAlCarrito(producto);
        });

        const btn_fav = document.createElement("button");
        btn_fav.innerText = "Agregar a favoritos";
        btn_fav.classList.add("btn");

        const btn_comprar = document.createElement("button");
        btn_comprar.innerText = "Comprar";
        btn_comprar.classList.add("btn", "comparar");

        nombre.innerText = producto.nombre_producto;

        p_descripcion.innerHTML = `<strong>Descripción:</strong> ${producto.descripcion}`;
        p_categoria.innerHTML = `<strong>Categoría:</strong> ${producto.categoria_producto}`;
        p_ingrediente.innerHTML = `<strong>Ingrediente activo:</strong> ${producto.ingrediente_activo}`;
        p_cantidad_disponible.innerHTML = `<strong>Cantidad disponible:</strong> ${producto.cantidad}`;
        p_precio.innerHTML = `<strong>Precio:</strong> ${producto.precio}`;

        div_botones.appendChild(btn_carrito);
        div_botones.appendChild(btn_fav);
        div_acciones.appendChild(div_botones);
        div_acciones.appendChild(btn_comprar);

        div_info.appendChild(p_descripcion);
        div_info.appendChild(p_categoria);
        div_info.appendChild(p_ingrediente);
        div_info.appendChild(p_cantidad_disponible);
        div_info.appendChild(p_precio);
        div_info.appendChild(div_acciones);

        div_imagen.appendChild(img_producto);
        div_imagen.appendChild(nombre);

        div_general.appendChild(div_imagen);
        div_general.appendChild(div_info);

        // ============================================================
        // ⭐ AGREGAR A FAVORITOS (corregido)
        // ============================================================
        btn_fav.addEventListener("click", async () => {

            const usuarioId = localStorage.getItem("usuarioId");

            if (!usuarioId) {
                alert("Debes iniciar sesión para agregar favoritos");
                window.location.href = "login.html";
                return;
            }

            try {
                const respuesta = await fetch(`${API_URL}/favoritos`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        usuarioId: usuarioId,
                        productoId: producto.id_producto
                    })
                });

                const data = await respuesta.json();

                if (respuesta.ok) {
                    alert("Agregado a favoritos ❤️");
                    window.location.href = "favoritos.html";
                } else {
                    alert("Error: " + data.error);
                }

            } catch (err) {
                console.error(err);
                alert("Error conectando con el servidor");
            }

        });

    });

}

descripcion_producto();
