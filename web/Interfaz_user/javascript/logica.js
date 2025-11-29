// ============================================================
// Archivo: logica.js (CATÁLOGO + FAVORITOS + SINCRONIZACIÓN)
// ============================================================

const paginaActual = window.location.pathname;
const API_URL = "https://agroinsumos-san-pedro-despliegue.onrender.com";


// ============================================================
// DOMContentLoaded ÚNICO PARA TODO
// ============================================================
document.addEventListener("DOMContentLoaded", () => {

    // 1. CARGAR CATALOGO PRINCIPAL
    if (document.getElementById("contenedor-tarjetas")) {
        cargarCategorias();
        activarRadiosCatalogo();
    }

    // 2. MOSTRAR BIENVENIDA
    const usuario = JSON.parse(localStorage.getItem("usuario"));
    const span = document.getElementById("bienvenida");
    if (usuario && span) span.innerText = `Bienvenido, ${usuario.nombre_usuario} 👋`;
});


// ============================================================
// ACTIVAR RADIOS PARA FILTRAR CATALOGO
// ============================================================
function activarRadiosCatalogo() {
    const radios = document.querySelectorAll('input[name="tipo-busqueda"]');

    radios.forEach(radio => {
        radio.addEventListener("change", async (e) => {

            let url = "";
            if (e.target.value === "producto") url = "categorias";
            if (e.target.value === "marca") url = "marcas";
            if (e.target.value === "ingrediente") url = "ingrediente";

            try {
                const resp = await fetch(`${API_URL}/usuarios/${url}`);
                const data = await resp.json();

                const titulo =
                    e.target.value === "marca" ? "CATÁLOGO POR MARCA" :
                    e.target.value === "ingrediente" ? "CATÁLOGO POR INGREDIENTE ACTIVO" :
                    "CATÁLOGO DE PRODUCTOS";

                mostrarTarjetas(data, titulo);

            } catch (err) {
                console.error(err);
                alert("Error de conexión.");
            }
        });
    });
}


// ============================================================
// CARGAR CATEGORÍAS
// ============================================================
async function cargarCategorias() {
    try {
        const resp = await fetch(`${API_URL}/usuarios/categorias`);
        const data = await resp.json();
        mostrarTarjetas(data, "CATÁLOGO DE PRODUCTOS");
    } catch (err) {
        console.error(err);
    }
}


// ============================================================
// MOSTRAR TARJETAS EN CATÁLOGO PRINCIPAL
// ============================================================
function mostrarTarjetas(lista, tituloTexto) {

    const contenedor = document.getElementById("contenedor-tarjetas");
    const titulo = document.getElementById("titulo-catalogo");
    if (!contenedor) return;

    contenedor.innerHTML = "";
    titulo.textContent = tituloTexto;

    lista.forEach(item => {
        const tarjeta = document.createElement("div");
        tarjeta.classList.add("tarjeta");
        tarjeta.style.backgroundImage = `url('${item.img}')`;

        tarjeta.innerHTML = `
            <div class="overlay">
                <p>${item.nombre}</p>
            </div>
        `;

        tarjeta.addEventListener("click", () => {
            window.location.href = `inven.html?categoria=${item.nombre.toUpperCase()}`;
        });

        contenedor.appendChild(tarjeta);
    });
}



// ============================================================
// REGISTRO
// ============================================================
async function registrar_usuario() {
    const nombre_usuario = document.getElementById("usuario").value.trim();
    const correo = document.getElementById("correo").value.trim();
    const password = document.getElementById("password").value.trim();

    try {
        const resp = await fetch(`${API_URL}/usuarios`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nombre_usuario, correo, password })
        });

        const data = await resp.json();
        if (!resp.ok) return alert("Error: " + data.error);

        alert("Usuario registrado ✔");
        window.location.href = "index.html";

    } catch {
        alert("Error de conexión");
    }
}



// ============================================================
// LOGIN
// ============================================================
async function login() {
    const correo = document.getElementById("correo").value.trim();
    const password = document.getElementById("password").value.trim();

    try {
        const resp = await fetch(`${API_URL}/usuarios/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ correo, password })
        });

        const data = await resp.json();
        if (!resp.ok) return alert("Error: " + data.error);

        localStorage.setItem("usuario", JSON.stringify(data.usuario));
        localStorage.setItem("usuarioId", data.usuario._id);

        window.location.href = "index.html";

    } catch {
        alert("Error de conexión");
    }
}



// ============================================================
// MOSTRAR PRODUCTOS POR CATEGORÍA (INVEN)
// ============================================================
let page = 1;
const params = new URLSearchParams(window.location.search);
const categoria = params.get("categoria");
if (categoria) mostrar_productos(categoria);

async function mostrar_productos(categoria) {

    const productos = document.getElementById("mostrar_productos_por_categoria");
    const loader = document.getElementById("loader");

    loader.classList.remove("oculto");
    productos.innerHTML = "";

    try {
        const resp = await fetch(`${API_URL}/usuarios/productos`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ categoria, page })
        });

        const data = await resp.json();
        loader.classList.add("oculto");

        const titulo = document.createElement("h2");
        titulo.innerText = categoria.toUpperCase();
        productos.appendChild(titulo);

        const favoritosLS = JSON.parse(localStorage.getItem("favoritosLS")) || [];
        const grid = document.createElement("div");
        grid.classList.add("productos-grid");

        data.productos.forEach(e => {
            const div = document.createElement("div");
            div.classList.add("tarjeta");

            const img = document.createElement("img");
            img.src = "../" + e.direccion_img;

            const n = document.createElement("h3");
            n.innerText = e.nombre_producto;

            const precio = document.createElement("p");
            precio.innerText = `$${e.precio}`;

            const imgFav = document.createElement("img");
            imgFav.classList.add("btn-favorito");
            imgFav.src = favoritosLS.includes(e.nombre_producto)
                ? "imgs/corazon_lleno.png"
                : "imgs/corazon_vacio.png";

            imgFav.onclick = () =>
                toggleFavorito(e.id_producto, e.nombre_producto, imgFav);

            const btnVer = document.createElement("button");
            btnVer.innerText = "Ver producto";
            btnVer.classList.add("btn", "comprar");
            btnVer.onclick = () => cambiar_pagina(e);

            div.append(img, n, precio, imgFav, btnVer);
            grid.appendChild(div);
        });

        productos.appendChild(grid);

    } catch {
        alert("Error de conexión con API");
    }
}



// ============================================================
// FAVORITOS INVENTARIO — AGREGAR / QUITAR
// ============================================================
async function toggleFavorito(productoId, nombreProducto, imgElem) {

    const usuarioId = localStorage.getItem("usuarioId");
    if (!usuarioId) {
        alert("Debes iniciar sesión");
        return;
    }

    let favsLS = JSON.parse(localStorage.getItem("favoritosLS")) || [];
    const yaEsta = favsLS.includes(nombreProducto);

    // --------------------------
    // QUITAR FAVORITO
    // --------------------------
    if (yaEsta) {

        favsLS = favsLS.filter(n => n !== nombreProducto);
        localStorage.setItem("favoritosLS", JSON.stringify(favsLS));

        imgElem.src = "imgs/corazon_vacio.png";

        try {
            const resp = await fetch(`${API_URL}/favoritos/${usuarioId}`);
            const data = await resp.json();
            const lista = data.favoritos || [];

            const favOriginal = lista.find(f =>
                f.producto &&
                String(f.producto.id_producto) === String(productoId)
            );

            if (favOriginal && favOriginal._id) {
                await fetch(`${API_URL}/favoritos/${favOriginal._id}`, {
                    method: "DELETE"
                });
            }

        } catch (err) {
            console.error("Error eliminando favorito en backend:", err);
        }

        localStorage.setItem("actualizarFavoritos", "1");
        localStorage.setItem("productoEliminado", nombreProducto);

        return;
    }

    // --------------------------
    // AGREGAR FAVORITO
    // --------------------------
    favsLS.push(nombreProducto);
    localStorage.setItem("favoritosLS", JSON.stringify(favsLS));

    imgElem.src = "imgs/corazon_lleno.png";

    try {
        await fetch(`${API_URL}/favoritos`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ usuarioId, productoId })
        });
    } catch (err) {
        console.error("Error al agregar favorito:", err);
    }
}



// ============================================================
// VER PRODUCTO
// ============================================================
function cambiar_pagina(producto) {
    localStorage.setItem("productoSeleccionado", JSON.stringify(producto));
    window.location.href = "producto.html";
}


// ============================================================
// BUSCADOR IA
// ============================================================
const URL_BACKEND_IA = `${API_URL}/api/ia/interpretar`;
const btnBuscarIA = document.getElementById("btn-buscar-ia");
const inputBusqueda = document.getElementById("input-busqueda");

if (btnBuscarIA) {
    btnBuscarIA.addEventListener("click", interpretarBusqueda);
    inputBusqueda.addEventListener("keypress", e => {
        if (e.key === "Enter") interpretarBusqueda();
    });
}

async function interpretarBusqueda() {
    const texto = inputBusqueda.value.trim();
    if (!texto) return alert("Escribe algo para buscar");

    const resp = await fetch(URL_BACKEND_IA, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ texto })
    });

    const data = await resp.json();
    if (!data.categoria) return alert("No se reconoció la categoría");

    window.location.href = `inven.html?categoria=${data.categoria}`;
}


// ============================================================
// SINCRONIZAR INVENTARIO CUANDO FAVORITOS.HTML ELIMINA UNO
// ============================================================
document.addEventListener("DOMContentLoaded", () => {

    if (localStorage.getItem("actualizarInventario") === "1") {
        
        const nombreEliminado = localStorage.getItem("productoEliminado");

        if (nombreEliminado) {
            let favsLS = JSON.parse(localStorage.getItem("favoritosLS")) || [];
            favsLS = favsLS.filter(n => n !== nombreEliminado);
            localStorage.setItem("favoritosLS", JSON.stringify(favsLS));
        }

        localStorage.removeItem("actualizarInventario");
        localStorage.removeItem("productoEliminado");

        // Recargar íconos del inventario solo si estamos en inven.html
        if (document.getElementById("mostrar_productos_por_categoria")) {
            location.reload();
        }
    }
});



// ============================================================
// RELOAD AL VOLVER DEL HISTORIAL
// ============================================================
window.addEventListener("pageshow", (e) => {
    if (e.persisted) location.reload();
});
