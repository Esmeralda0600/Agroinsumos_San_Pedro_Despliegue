// ============================================================
// Archivo: logica.js (CATÁLOGO + INVENTARIO + FAVORITOS)
// ============================================================

const API_URL = "https://agroinsumos-san-pedro-despliegue.onrender.com";


// ============================================================
// DOMContentLoaded GENERAL
// ============================================================
document.addEventListener("DOMContentLoaded", () => {

    // Si estamos en catálogo
    if (document.getElementById("contenedor-tarjetas")) {
        cargarCategorias();
        activarRadiosCatalogo();
    }

    // Bienvenida
    const usuario = JSON.parse(localStorage.getItem("usuario"));
    const span = document.getElementById("bienvenida");
    if (usuario && span) span.innerText = `Bienvenido, ${usuario.nombre_usuario} 👋`;

    // Sincronizar inventario si favoritos.html eliminó algo
    sincronizarInventario();
});


// ============================================================
// CATALOGO
// ============================================================
function activarRadiosCatalogo() {
    const radios = document.querySelectorAll('input[name="tipo-busqueda"]');

    radios.forEach(radio => {
        radio.addEventListener("change", async e => {
            let url = "";

            if (e.target.value === "producto") url = "categorias";
            if (e.target.value === "marca") url = "marcas";
            if (e.target.value === "ingrediente") url = "ingrediente";

            const resp = await fetch(`${API_URL}/usuarios/${url}`);
            const data = await resp.json();

            const titulo = e.target.value === "marca"
                ? "CATÁLOGO POR MARCA"
                : e.target.value === "ingrediente"
                ? "CATÁLOGO POR INGREDIENTE ACTIVO"
                : "CATÁLOGO DE PRODUCTOS";

            mostrarTarjetas(data, titulo);
        });
    });
}

async function cargarCategorias() {
    const resp = await fetch(`${API_URL}/usuarios/categorias`);
    const data = await resp.json();
    mostrarTarjetas(data, "CATÁLOGO DE PRODUCTOS");
}

function mostrarTarjetas(lista, tituloTexto) {
    const contenedor = document.getElementById("contenedor-tarjetas");
    const titulo = document.getElementById("titulo-catalogo");

    if (!contenedor) return;
    contenedor.innerHTML = "";
    titulo.textContent = tituloTexto;

    lista.forEach(item => {
        const div = document.createElement("div");
        div.classList.add("tarjeta");
        div.style.backgroundImage = `url('${item.img}')`;

        div.innerHTML = `
            <div class="overlay">
                <p>${item.nombre}</p>
            </div>
        `;

        div.addEventListener("click", () => {
            window.location.href = `inven.html?categoria=${item.nombre.toUpperCase()}`;
        });

        contenedor.appendChild(div);
    });
}


// ============================================================
// LOGIN Y REGISTRO
// ============================================================
async function registrar_usuario() {
    const nombre_usuario = document.getElementById("usuario").value.trim();
    const correo = document.getElementById("correo").value.trim();
    const password = document.getElementById("password").value.trim();

    const resp = await fetch(`${API_URL}/usuarios`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre_usuario, correo, password })
    });

    const data = await resp.json();
    if (!resp.ok) return alert("Error: " + data.error);

    alert("Usuario registrado ✔");
    window.location.href = "index.html";
}

async function login() {
    const correo = document.getElementById("correo").value.trim();
    const password = document.getElementById("password").value.trim();

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
}


// ============================================================
// INVENTARIO (INVEN.HTML)
// ============================================================
let page = 1;
const params = new URLSearchParams(window.location.search);
const categoria = params.get("categoria");
if (categoria) mostrar_productos(categoria);

async function mostrar_productos(categoria) {

    const productos = document.getElementById("mostrar_productos_por_categoria");
    const loader = document.getElementById("loader");

    if (!productos) return;

    loader.classList.remove("oculto");
    productos.innerHTML = "";

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

        const id = String(e.id_producto);
        const esFav = favoritosLS.some(f => f.id === id);

        const div = document.createElement("div");
        div.classList.add("tarjeta");

        const imgFav = document.createElement("img");
        imgFav.classList.add("btn-favorito");
        imgFav.src = esFav ? "imgs/corazon_lleno.png" : "imgs/corazon_vacio.png";

        imgFav.onclick = () => toggleFavorito(id, e.nombre_producto, imgFav);

        div.innerHTML = `
            <img src="../${e.direccion_img}">
            <h3>${e.nombre_producto}</h3>
            <p>$${e.precio}</p>
        `;

        const btnVer = document.createElement("button");
        btnVer.innerText = "Ver producto";
        btnVer.classList.add("btn", "comprar");
        btnVer.onclick = () => cambiar_pagina(e);

        div.append(imgFav, btnVer);
        grid.appendChild(div);
    });

    productos.appendChild(grid);
}


// ============================================================
// FAVORITOS → AGREGAR/QUITAR (UNIFICADO AL 100%)
// ============================================================
async function toggleFavorito(productoId, nombre, imgElem) {

    const usuarioId = localStorage.getItem("usuarioId");
    if (!usuarioId) return alert("Debes iniciar sesión");

    let favsLS = JSON.parse(localStorage.getItem("favoritosLS")) || [];
    const yaEsta = favsLS.some(f => f.id === productoId);

    // ------------------ QUITAR FAVORITO ------------------
    if (yaEsta) {
        favsLS = favsLS.filter(f => f.id !== productoId);
        localStorage.setItem("favoritosLS", JSON.stringify(favsLS));

        imgElem.src = "imgs/corazon_vacio.png";

        // borrar en backend
        const resp = await fetch(`${API_URL}/favoritos/${usuarioId}`);
        const data = await resp.json();

        const fav = data.favoritos.find(f =>
            String(f.producto?.id_producto) === String(productoId)
        );

        if (fav) {
            await fetch(`${API_URL}/favoritos/${fav._id}`, { method: "DELETE" });
        }

        // avisar a favoritos.html
        localStorage.setItem("actualizarFavoritos", "1");
        localStorage.setItem("productoEliminado", productoId);

        return;
    }

    // ------------------ AGREGAR FAVORITO ------------------
    favsLS.push({ id: productoId, nombre });
    localStorage.setItem("favoritosLS", JSON.stringify(favsLS));

    imgElem.src = "imgs/corazon_lleno.png";

    await fetch(`${API_URL}/favoritos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usuarioId, productoId })
    });
}


// ============================================================
// SINCRONIZAR INVENTARIO SI FAVORITOS.HTML BORRA UNO
// ============================================================
function sincronizarInventario() {
    if (localStorage.getItem("actualizarInventario") !== "1") return;

    const eliminado = localStorage.getItem("productoEliminado");

    let favsLS = JSON.parse(localStorage.getItem("favoritosLS")) || [];
    favsLS = favsLS.filter(f => f.id !== eliminado);
    localStorage.setItem("favoritosLS", JSON.stringify(favsLS));

    localStorage.removeItem("actualizarInventario");
    localStorage.removeItem("productoEliminado");

    if (document.getElementById("mostrar_productos_por_categoria")) {
        location.reload();
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
// RECARGAR SI VOLVEMOS CON HISTORIAL
// ============================================================
window.addEventListener("pageshow", e => {
    if (e.persisted) location.reload();
});
