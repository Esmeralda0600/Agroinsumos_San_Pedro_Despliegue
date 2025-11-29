// ============================================================
// Archivo: logica.js (CATÁLOGO + INVENTARIO + FAVORITOS)
// ============================================================

const API_URL = "https://agroinsumos-san-pedro-despliegue.onrender.com";


// ============================================================
// DOMContentLoaded ÚNICO
// ============================================================
document.addEventListener("DOMContentLoaded", () => {

    if (document.getElementById("contenedor-tarjetas")) {
        cargarCategorias();
        activarRadiosCatalogo();
    }

    const usuario = JSON.parse(localStorage.getItem("usuario"));
    const span = document.getElementById("bienvenida");
    if (usuario && span) span.innerText = `Bienvenido, ${usuario.nombre_usuario} 👋`;

    sincronizarInventario();
});


// ============================================================
// FILTROS DEL CATÁLOGO
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


// ============================================================
// CARGAR CATEGORÍAS
// ============================================================
async function cargarCategorias() {
    const resp = await fetch(`${API_URL}/usuarios/categorias`);
    const data = await resp.json();
    mostrarTarjetas(data, "CATÁLOGO DE PRODUCTOS");
}


// ============================================================
// MOSTRAR TARJETAS
// ============================================================
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

        div.innerHTML = `<div class="overlay"><p>${item.nombre}</p></div>`;

        div.addEventListener("click", () => {
            window.location.href = `inven.html?categoria=${item.nombre.toUpperCase()}`;
        });

        contenedor.appendChild(div);
    });
}


// ============================================================
// LOGIN & REGISTRO
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
    if (!resp.ok) return alert(data.error);
    alert("Registrado ✔");
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
    if (!resp.ok) return alert(data.error);

    localStorage.setItem("usuario", JSON.stringify(data.usuario));
    localStorage.setItem("usuarioId", data.usuario._id);

    window.location.href = "index.html";
}


// ============================================================
// MOSTRAR INVENTARIO (inven.html)
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

    const favsLS = JSON.parse(localStorage.getItem("favoritosLS")) || [];

    const grid = document.createElement("div");
    grid.classList.add("productos-grid");

    data.productos.forEach(e => {

        const esFav = favsLS.some(f => f.id == e.id_producto);

        const div = document.createElement("div");
        div.classList.add("tarjeta");

        div.innerHTML = `
            <img src="../${e.direccion_img}">
            <h3>${e.nombre_producto}</h3>
            <p>$${e.precio}</p>
        `;

        const imgFav = document.createElement("img");
        imgFav.classList.add("btn-favorito");
        imgFav.src = esFav ? "imgs/corazon_lleno.png" : "imgs/corazon_vacio.png";

        imgFav.onclick = () => toggleFavorito(e.id_producto, e.nombre_producto, imgFav);

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
// AGREGAR / QUITAR FAVORITO (AHORA SI FUNCIONA)
// ============================================================
async function toggleFavorito(productoId, nombreProducto, imgElem) {

    const usuarioId = localStorage.getItem("usuarioId");
    if (!usuarioId) return alert("Debes iniciar sesión");

    let favsLS = JSON.parse(localStorage.getItem("favoritosLS")) || [];

    const yaEsta = favsLS.some(f => f.id == productoId);

    // -------- QUITAR --------
    if (yaEsta) {

        favsLS = favsLS.filter(f => f.id != productoId);
        localStorage.setItem("favoritosLS", JSON.stringify(favsLS));
        imgElem.src = "imgs/corazon_vacio.png";

        const resp = await fetch(`${API_URL}/favoritos/${usuarioId}`);
        const data = await resp.json();
        const fav = data.favoritos.find(f => f.producto?.id_producto == productoId);

        if (fav) {
            await fetch(`${API_URL}/favoritos/${fav._id}`, { method: "DELETE" });
        }

        localStorage.setItem("actualizarFavoritos", "1");
        localStorage.setItem("productoEliminado", productoId);

        return;
    }

    // -------- AGREGAR --------
    favsLS.push({ id: productoId, nombre: nombreProducto });
    localStorage.setItem("favoritosLS", JSON.stringify(favsLS));
    imgElem.src = "imgs/corazon_lleno.png";

    await fetch(`${API_URL}/favoritos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usuarioId, productoId })
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
// SINCRONIZAR INVENTARIO (cuando favoritos.html elimina uno)
// ============================================================
function sincronizarInventario() {

    if (localStorage.getItem("actualizarInventario") !== "1") return;

    const eliminado = localStorage.getItem("productoEliminado");

    let favsLS = JSON.parse(localStorage.getItem("favoritosLS")) || [];
    favsLS = favsLS.filter(f => f.id != eliminado);
    localStorage.setItem("favoritosLS", JSON.stringify(favsLS));

    localStorage.removeItem("actualizarInventario");
    localStorage.removeItem("productoEliminado");

    if (document.getElementById("mostrar_productos_por_categoria")) {
        location.reload();
    }
}


// ============================================================
// RECARGAR SI VOLVEMOS CON HISTORIAL
// ============================================================
window.addEventListener("pageshow", e => {
    if (e.persisted) location.reload();
});
