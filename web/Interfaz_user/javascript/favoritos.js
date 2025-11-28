// ============================================================
// Archivo: logica.js (CATÁLOGO + FAVORITOS CON CORAZÓN PNG)
// ============================================================

const paginaActual = window.location.pathname;

// URL DE LA API EN PRODUCCIÓN
const API_URL = "https://agroinsumos-san-pedro-despliegue.onrender.com";


// ============================================================
// BOTONES LOGIN Y REGISTRO
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
// FUNCIONES DE CATÁLOGO
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
// MOSTRAR PRODUCTOS POR CATEGORÍA
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

        // Favoritos locales
        let favoritosLS = JSON.parse(localStorage.getItem("favoritosLS")) || [];

        data.productos.forEach((e) => {
            const div = document.createElement("div");
            div.classList.add("tarjeta");

            const img = document.createElement("img");
            img.src = "../" + e.direccion_img;
            img.width = 200;

            const n = document.createElement("h3");
            n.innerText = e.nombre_producto;

            const precio = document.createElement("p");
            precio.innerText = ` $${e.precio}`;


            // ===============================================
            // CORAZÓN PNG (VACÍO / LLENO)
            // ===============================================
            const imgFav = document.createElement("img");
            imgFav.classList.add("btn-favorito");
            imgFav.dataset.id = e.id_producto;

            if (favoritosLS.includes(e.nombre_producto)) {
                imgFav.src = "imgs/corazon_lleno.png";
            } else {
                imgFav.src = "imgs/corazon_vacio.png";
            }

            imgFav.onclick = () => toggleFavorito(
                e.id_producto,
                imgFav,
                e.nombre_producto
            );



            // VER PRODUCTO
            const btnVer = document.createElement("button");
            btnVer.innerText = "Ver producto";
            btnVer.classList.add("btn", "comprar");
            btnVer.onclick = () => cambiar_pagina(e);

            div.append(img, n, precio, imgFav, btnVer);
            grid.appendChild(div);
        });

        productos.appendChild(grid);


        // PAGINACIÓN
        if (data.totalPaginas > 1) {
            const controles = document.createElement("div");
            controles.classList.add("volver");

            if (data.paginaActual > 1) {
                const btnPrev = document.createElement("button");
                btnPrev.classList.add("btn-volver");
                btnPrev.innerText = "Anterior";
                btnPrev.onclick = () => {
                    page--;
                    mostrar_productos(categoria);
                };
                controles.appendChild(btnPrev);
            }

            if (data.paginaActual != data.totalPaginas) {
                const btnNext = document.createElement("button");
                btnNext.classList.add("btn-volver");
                btnNext.innerText = "Siguiente";
                btnNext.onclick = () => {
                    page++;
                    mostrar_productos(categoria);
                };
                controles.appendChild(btnNext);
            }

            productos.appendChild(controles);
        }

    } catch {
        alert("Error de conexión con la API");
    }
}



// ============================================================
// FAVORITOS AGREGAR / ELIMINAR
// ============================================================
async function toggleFavorito(productoId, imgElem, nombre_producto) {
    const usuarioId = localStorage.getItem("usuarioId");

    if (!usuarioId) {
        alert("Debes iniciar sesión para gestionar favoritos.");
        return window.location.href = "login.html";
    }

    let favoritosLS = JSON.parse(localStorage.getItem("favoritosLS")) || [];
    const yaEsta = favoritosLS.includes(nombre_producto);

    if (yaEsta) {
        // QUITAR FAVORITO
        favoritosLS = favoritosLS.filter(n => n !== nombre_producto);
        localStorage.setItem("favoritosLS", JSON.stringify(favoritosLS));
        imgElem.src = "imgs/corazon_vacio.png";

        // Eliminar del backend por nombre
        await fetch(`${API_URL}/favoritos/eliminar-por-nombre`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ usuarioId, nombre: nombre_producto })
        });

        return;
    }

    // AGREGAR FAVORITO
    favoritosLS.push(nombre_producto);
    localStorage.setItem("favoritosLS", JSON.stringify(favoritosLS));
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
// TARJETAS DE CATÁLOGO PRINCIPAL
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

document.getElementById("btn-buscar-ia").addEventListener("click", interpretarBusqueda);
document.getElementById("input-busqueda").addEventListener("keypress", e => {
  if (e.key === "Enter") interpretarBusqueda();
});

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
    console.log("Respuesta IA:", data);

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
