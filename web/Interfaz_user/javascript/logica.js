// ============================================================
// Archivo: logica.js (CATÁLOGO + FAVORITOS CON CORAZÓN PNG)
// ============================================================

const paginaActual = window.location.pathname;

// URL DE LA API EN PRODUCCIÓN
const API_URL = "https://agroinsumos-san-pedro-despliegue.onrender.com";


// ============================================================
// BOTONES LOGIN AND REGISTRO
// ============================================================
const btn_registro = document.getElementById("boton_registro");
if (btn_registro && paginaActual.includes("registro")) {
    btn_registro.addEventListener("click", registrar_usuario);
}

const btn_login = document.getElementById("boton-login");
if (btn_login && paginaActual.includes("login")) {
    btn_login.addEventListener("click", login);
}


// ============================================================
// FUNCIONES DE CATÁLOGO (CATEGORÍAS / MARCAS / INGREDIENTES)
// ============================================================
const radios = document.querySelectorAll('input[name="tipo-busqueda"]');
if (radios.length != 0) cargarCategorias();

async function cargarCategorias() {
    try {
        const resp = await fetch(`${API_URL}/usuarios/categorias`);
        const data = await resp.json();
        if (!resp.ok) return alert("Error: " + data.error);

        mostrarTarjetas(data, "CATÁLOGO DE PRODUCTOS");
    } catch {
        alert("Error de conexión");
    }

    radios.forEach(radio => {
        radio.addEventListener("change", async (e) => {
            let url = "";
            if (e.target.value === "producto") url = "categorias";
            if (e.target.value === "marca") url = "marcas";
            if (e.target.value === "ingrediente") url = "ingrediente";

            try {
                const resp = await fetch(`${API_URL}/usuarios/${url}`);
                const data = await resp.json();
                if (!resp.ok) return alert("Error: " + data.error);

                const titulo =
                    e.target.value === "marca" ? "CATÁLOGO POR MARCA" :
                    e.target.value === "ingrediente" ? "CATÁLOGO POR INGREDIENTE ACTIVO" :
                    "CATÁLOGO DE PRODUCTOS";

                mostrarTarjetas(data, titulo);
            } catch {
                alert("Error de conexión");
            }
        });
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
        alert("Error de conexión con la API");
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

        alert("Inicio de sesión exitoso 👌");
        localStorage.setItem("usuario", JSON.stringify(data.usuario));
        localStorage.setItem("usuarioId", data.usuario._id);
        window.location.href = "index.html";

    } catch {
        alert("Error de conexión");
    }
}


// ============================================================
// BIENVENIDA
// ============================================================
document.addEventListener("DOMContentLoaded", () => {
    const usuario = JSON.parse(localStorage.getItem("usuario"));
    const span = document.getElementById("bienvenida");

    if (usuario && span) span.innerText = `Bienvenido, ${usuario.nombre_usuario} 👋`;
});


// ============================================================
// MOSTRAR PRODUCTOS POR CATEGORÍA (INVEN.HTML)
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
    productos.classList.add("catalogo");

    try {
        const resp = await fetch(`${API_URL}/usuarios/productos`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ categoria, page })
        });

        const data = await resp.json();
        if (!resp.ok) return alert("Error: " + data.error);

        loader.classList.add("oculto");

        const titulo = document.createElement("h2");
        titulo.innerText = categoria.toUpperCase();
        productos.appendChild(titulo);

        const grid = document.createElement("div");
        grid.classList.add("productos-grid");

        let favoritosLS = JSON.parse(localStorage.getItem("favoritosLS")) || [];

        data.productos.forEach((e) => {
            const div = document.createElement("div");
            div.classList.add("tarjeta");

            const img = document.createElement("img");
            img.src = "../" + e.direccion_img;

            const n = document.createElement("h3");
            n.innerText = e.nombre_producto;

            const precio = document.createElement("p");
            precio.innerText = ` $${e.precio}`;

            const imgFav = document.createElement("img");
            imgFav.classList.add("btn-favorito");

            if (favoritosLS.includes(e.nombre_producto)) {
                imgFav.src = "imgs/corazon_lleno.png";
                imgFav.classList.add("favorito-activo");
            } else {
                imgFav.src = "imgs/corazon_vacio.png";
            }

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
        alert("Error de conexión con la API");
    }
}


// ============================================================
// FAVORITOS: AGREGAR / QUITAR (INVEN + BACKEND)
// ============================================================
async function toggleFavorito(productoId, nombreProducto, imgElem) {
    const usuarioId = localStorage.getItem("usuarioId");

    if (!usuarioId) {
        alert("Debes iniciar sesión para agregar favoritos.");
        return window.location.href = "login.html";
    }

    let favsLS = JSON.parse(localStorage.getItem("favoritosLS")) || [];
    const yaEsta = favsLS.includes(nombreProducto);

    // ==========================
    // SI YA ESTÁ: QUITAR FAVORITO
    // ==========================
    if (yaEsta) {
        favsLS = favsLS.filter(n => n !== nombreProducto);
        localStorage.setItem("favoritosLS", JSON.stringify(favsLS));

        imgElem.src = "imgs/corazon_vacio.png";
        imgElem.classList.remove("favorito-activo");

        try {
            const resp = await fetch(`${API_URL}/favoritos/${usuarioId}`);
            const data = await resp.json();
            const lista = data.favoritos || [];

            const favOriginal = lista.find(f =>
                f.producto && f.producto.id_producto === productoId
            );

            if (favOriginal && favOriginal._id) {
                await fetch(`${API_URL}/favoritos/${favOriginal._id}`, {
                    method: "DELETE"
                });
            }
        } catch (err) {
            console.error("Error eliminando en backend:", err);
        }

        return;
    }

    // ==========================
    // SI NO ESTÁ: AGREGAR FAVORITO
    // ==========================
    favsLS.push(nombreProducto);
    localStorage.setItem("favoritosLS", JSON.stringify(favsLS));

    imgElem.src = "imgs/corazon_lleno.png";
    imgElem.classList.add("favorito-activo");

    try {
        await fetch(`${API_URL}/favoritos`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ usuarioId, productoId })
        });
    } catch (err) {
        console.error("Error agregando favorito:", err);
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
// TARJETAS DEL CATÁLOGO PRINCIPAL
// ============================================================
function mostrarTarjetas(lista, tituloTexto) {
    const contenedor = document.getElementById("contenedor-tarjetas");
    const titulo = document.getElementById("titulo-catalogo");

    contenedor.innerHTML = "";
    titulo.textContent = tituloTexto;

    lista.forEach((item) => {
        const tarjeta = document.createElement("div");
        tarjeta.classList.add("tarjeta");
        tarjeta.style.backgroundImage = `url('${item.img}')`;

        tarjeta.innerHTML = `<div class="overlay"><p>${item.nombre}</p></div>`;

        tarjeta.style.cursor = "pointer";
        tarjeta.addEventListener("click", () => {
            window.location.href = `inven.html?categoria=${item.nombre.toUpperCase()}`;
        });

        contenedor.appendChild(tarjeta);
    });
}


// ============================================================
// CARRITO
// ============================================================
function agregarAlCarrito(producto) {
    let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

    const existe = carrito.find(p => p.id_producto === producto.id_producto);

    if (existe) {
        existe.cantidad += 1;
    } else {
        carrito.push({
            id_producto: producto.id_producto,
            nombre: producto.nombre_producto,
            precio: producto.precio,
            cantidad: 1,
            imagen: producto.direccion_img || "imgs/default.png"
        });
    }

    localStorage.setItem("carrito", JSON.stringify(carrito));
    alert("Producto agregado al carrito 🛒");
}


/* ============================================================
   BUSCADOR INTELIGENTE CON IA (VÍA BACKEND)
   ============================================================ */

const URL_BACKEND_IA = "https://agroinsumos-san-pedro-despliegue.onrender.com/api/ia/interpretar";

const btnBuscarIA = document.getElementById("btn-buscar-ia");
const inputBusqueda = document.getElementById("input-busqueda");

if (btnBuscarIA && inputBusqueda) {
    btnBuscarIA.addEventListener("click", interpretarBusqueda);
    inputBusqueda.addEventListener("keypress", e => {
        if (e.key === "Enter") interpretarBusqueda();
    });
}

async function interpretarBusqueda() {
  const texto = document.getElementById("input-busqueda").value.trim();

  if (!texto) {
    alert("Por favor escribe lo que deseas buscar.");
    return;
  }

  try {
    const response = await fetch(URL_BACKEND_IA, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ texto })
    });

    const data = await response.json();

    const categoria = data.categoria;

    if (!categoria) {
      alert("No se pudo identificar la categoría.");
      return;
    }

    const URL_BASE = "https://agroinsumos-san-pedro-despliegue-us-eight.vercel.app";

    window.location.href = `${URL_BASE}/inven.html?categoria=${categoria}`;

  } catch (error) {
    console.error("Error con IA:", error);
    alert("Ocurrió un error al procesar la búsqueda.");
  }
}


// ===========================
// FORZAR REFRESCO AL VOLVER
// ===========================
window.addEventListener("pageshow", function (event) {
    if (event.persisted) {
        location.reload();
    }
});
