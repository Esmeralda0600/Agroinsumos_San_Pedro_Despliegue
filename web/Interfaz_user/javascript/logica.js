// ============================================================
// Archivo: logica.js — Catálogo, Inventario, Favoritos, Buscador IA
// ============================================================

const API_URL = "https://agroinsumos-san-pedro-despliegue.onrender.com";


// ============================================================
// DOMContentLoaded — CARGA INICIAL
// ============================================================
document.addEventListener("DOMContentLoaded", () => {

    // Catálogo
    if (document.getElementById("contenedor-tarjetas")) {
        cargarCategorias();
        activarRadiosCatalogo();
    }

    // Bienvenida
    const usuario = JSON.parse(localStorage.getItem("usuario"));
    const span = document.getElementById("bienvenida");
    if (usuario && span) {
        span.innerText = `Bienvenido, ${usuario.nombre_usuario} 👋`;
    }

    // Sincronizar inventario ← si eliminaste en favoritos.html
    sincronizarInventario();
});


// ============================================================
// CATALOGO → FILTROS
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

            const titulo =
                e.target.value === "marca" ? "CATÁLOGO POR MARCA" :
                e.target.value === "ingrediente" ? "CATÁLOGO POR INGREDIENTE ACTIVO" :
                "CATÁLOGO DE PRODUCTOS";

            mostrarTarjetas(data, titulo);
        });
    });
}


// ============================================================
// CARGAR CATEGORÍAS
// ============================================================
async function cargarCategorias() {
    const resp = await fetch(`${API_URL}/usuarios/categorias`);
    const data = await resp.json();
    mostrarTarjetas(data, "CATÁLOGO DE PRODUCTOS");
}


// ============================================================
// MOSTRAR TARJETAS DE CATEGORÍAS
// ============================================================
function mostrarTarjetas(lista, tituloTexto) {
    const contenedor = document.getElementById("contenedor-tarjetas");
    const titulo = document.getElementById("titulo-catalogo");

    contenedor.innerHTML = "";
    titulo.textContent = tituloTexto;

    lista.forEach(item => {
        const card = document.createElement("div");
        card.classList.add("tarjeta");
        card.style.backgroundImage = `url('${item.img}')`;

        card.innerHTML = `<div class="overlay"><p>${item.nombre}</p></div>`;

        card.onclick = () =>
            window.location.href = `inven.html?categoria=${item.nombre.toUpperCase()}`;

        contenedor.appendChild(card);
    });
}



// ============================================================
// INVENTARIO — MOSTRAR PRODUCTOS
// ============================================================
let page = 1;

const params = new URLSearchParams(window.location.search);
const categoria = params.get("categoria");
if (categoria) mostrar_productos(categoria);

async function mostrar_productos(categoria) {

    const contenedor = document.getElementById("mostrar_productos_por_categoria");
    const loader = document.getElementById("loader");
    if (!contenedor) return;

    loader.classList.remove("oculto");
    contenedor.innerHTML = "";

    const resp = await fetch(`${API_URL}/usuarios/productos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categoria, page })
    });

    const data = await resp.json();
    loader.classList.add("oculto");

    const titulo = document.createElement("h2");
    titulo.innerText = categoria.toUpperCase();
    contenedor.appendChild(titulo);

    const favsLS = JSON.parse(localStorage.getItem("favoritosLS")) || [];

    const grid = document.createElement("div");
    grid.classList.add("productos-grid");

    data.productos.forEach(p => {

        const esFav = favsLS.includes(p.nombre_producto);

        const card = document.createElement("div");
        card.classList.add("tarjeta");

        card.innerHTML = `
            <img src="../${p.direccion_img}">
            <h3>${p.nombre_producto}</h3>
            <p>$${p.precio}</p>
        `;

        const imgFav = document.createElement("img");
        imgFav.classList.add("btn-favorito");
        imgFav.src = esFav ? "imgs/corazon_lleno.png" : "imgs/corazon_vacio.png";

        imgFav.onclick = () => toggleFavorito(p.nombre_producto, imgFav);

        const btnVer = document.createElement("button");
        btnVer.innerText = "Ver producto";
        btnVer.classList.add("btn", "comprar");
        btnVer.onclick = () => cambiar_pagina(p);

        card.append(imgFav, btnVer);
        grid.appendChild(card);
    });

    contenedor.appendChild(grid);
}



// ============================================================
// FAVORITOS — AGREGAR / QUITAR DESDE INVENTARIO
//   ⚠ Usa SOLO nombre (porque backend no devuelve id_producto)
// ============================================================
async function toggleFavorito(nombreProducto, imgElem) {

    const usuarioId = localStorage.getItem("usuarioId");
    if (!usuarioId) {
        alert("Debes iniciar sesión");
        return window.location.href = "login.html";
    }

    let favsLS = JSON.parse(localStorage.getItem("favoritosLS")) || [];
    const yaEsta = favsLS.includes(nombreProducto);

    // --------------------------
    // ❌ QUITAR FAVORITO
    // --------------------------
    if (yaEsta) {

        favsLS = favsLS.filter(n => n !== nombreProducto);
        localStorage.setItem("favoritosLS", JSON.stringify(favsLS));
        imgElem.src = "imgs/corazon_vacio.png";

        // eliminar del backend por NOMBRE
        const resp = await fetch(`${API_URL}/favoritos/${usuarioId}`);
        const data = await resp.json();

        const fav = data.favoritos.find(f => f.nombre === nombreProducto);

        if (fav) {
            await fetch(`${API_URL}/favoritos/${fav._id}`, { method: "DELETE" });
        }

        // avisar a favoritos.html
        localStorage.setItem("actualizarFavoritos", "1");
        localStorage.setItem("productoEliminado", nombreProducto);

        return;
    }

    // --------------------------
    // ❤️ AGREGAR FAVORITO
    // --------------------------
    favsLS.push(nombreProducto);
    localStorage.setItem("favoritosLS", JSON.stringify(favsLS));

    imgElem.src = "imgs/corazon_lleno.png";

    // guardar en backend
    await fetch(`${API_URL}/favoritos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            usuarioId,
            nombre: nombreProducto // ← el backend lo registra por nombre
        })
    });
}



// ============================================================
// VER PRODUCTO
// ============================================================
function cambiar_pagina(producto) {
    localStorage.setItem("productoSeleccionado", JSON.stringify(producto));
    window.location.href = "producto.html";
}



// ============================================================
// SINCRONIZAR INVENTARIO SI FAVORITOS.HTML ELIMINÓ UNO
// ============================================================
function sincronizarInventario() {

    if (localStorage.getItem("actualizarInventario") !== "1") return;

    const nombre = localStorage.getItem("productoEliminado");

    if (nombre) {
        let favsLS = JSON.parse(localStorage.getItem("favoritosLS")) || [];
        favsLS = favsLS.filter(n => n !== nombre);
        localStorage.setItem("favoritosLS", JSON.stringify(favsLS));
    }

    localStorage.removeItem("actualizarInventario");
    localStorage.removeItem("productoEliminado");

    // recargar solo si estamos en inven.html
    if (document.getElementById("mostrar_productos_por_categoria")) {
        location.reload();
    }
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
// RECARGAR SI VOLVEMOS CON HISTORIAL
// ============================================================
window.addEventListener("pageshow", e => {
    if (e.persisted) location.reload();
});
