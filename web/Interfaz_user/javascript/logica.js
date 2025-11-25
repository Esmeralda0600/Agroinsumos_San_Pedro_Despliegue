// ============================================================
// Archivo: logica.js (versión producción con favoritos + redirect)
// ============================================================

const paginaActual = window.location.pathname;

// URL DE LA API EN PRODUCCIÓN
const API_URL = "https://agroinsumos-san-pedro-despliegue-kafy.onrender.com";

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
    console.log(categoria);
    try {
        console.log(categoria);
        const resp = await fetch(`${API_URL}/usuarios/productos`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ categoria, page })
        });
        console.log(categoria,resp);
        const data = await resp.json();
        if (!resp.ok) return alert("Error: " + data.error);

        loader.classList.add("oculto");

        const titulo = document.createElement("h2");
        titulo.innerText = categoria.toUpperCase();
        productos.appendChild(titulo);

        const grid = document.createElement("div");
        grid.classList.add("productos-grid");

        data.productos.forEach((e) => {
            const div = document.createElement("div");
            div.classList.add("tarjeta");

            const img = document.createElement("img");
            img.src = "../imgs/default.png";
            img.width = 200;

            const n = document.createElement("h3");
            n.innerText = e.nombre_producto;

            const precio = document.createElement("p");
            precio.innerText = ` $${e.precio}`;

            const btnFav = document.createElement("button");
            btnFav.innerText = "Añadir a favoritos";
            btnFav.classList.add("btn");
            btnFav.onclick = () => agregarAFavoritos(e.id_producto);

            const btnVer = document.createElement("button");
            btnVer.innerText = "Ver producto";
            btnVer.classList.add("btn", "comprar");
            btnVer.onclick = () => cambiar_pagina(e);

            div.append(img, n, precio, btnFav, btnVer);
            grid.appendChild(div);
        });
        productos.appendChild(grid);
        if (data.totalPaginas > 1){
            const controles = document.createElement("div");
            controles.classList.add("volver");
            if (data.paginaActual>1){
                const btnPrev = document.createElement("button");
                btnPrev.classList.add("btn-volver")
                btnPrev.innerText = "Anterior";
                btnPrev.disabled = page === 1;
                btnPrev.onclick = () => {
                    page--;
                    mostrar_productos(categoria);
                };
                controles.appendChild(btnPrev);
            };
            if (data.paginaActual!= data.totalPaginas){
                const btnNext = document.createElement("button");
                btnNext.classList.add("btn-volver")
                btnNext.innerText = "Siguiente";
                btnNext.disabled = page === data.totalPaginas;
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
// FUNCIÓN AÑADIR A FAVORITOS + REDIRECCIÓN
// ============================================================
async function agregarAFavoritos(productoId) {
    const usuarioId = localStorage.getItem("usuarioId");

    if (!usuarioId) {
        alert("Debes iniciar sesión para agregar favoritos.");
        return window.location.href = "login.html";
    }

    try {
        const resp = await fetch(`${API_URL}/favoritos`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ usuarioId, productoId })
        });

        const data = await resp.json();
        if (!resp.ok) return alert("Error: " + data.error);

        alert("Producto agregado a favoritos ❤️");
        window.location.href = "favoritos.html";

    } catch {
        alert("Error al conectar con la API");
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
// TARJETAS DE CATÁLOGO
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
   BUSCADOR INTELIGENTE CON IA PARA REDIRECCIÓN DE CATEGORÍAS
   ============================================================ */

const API_KEY = "AIzaSyBysGS4NIAyd6Wvk2E42QRgcsDEgge71iw";
const MODEL = "gemini-2.0-flash";

const URL_GEMINI = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`;

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

  // Muestra estado opcional
  console.log("Consultando IA para:", texto);

  const prompt = `
    Eres un sistema de búsqueda de una tienda de agroinsumos.
    El usuario escribió: "${texto}".

    Tu trabajo es identificar a qué categoría pertenece.

    Las únicas categorías válidas son exactamente estas:
    - SEMILLAS
    - FERTILIZANTES
    - PLAGUICIDAS
    - HERBICIDAS
    - FUNGICIDAS

    Devuelve SOLO un objeto JSON con este formato exacto:

    {
      "categoria": "..."
    }

    Donde "categoria" debe ser una de las categorías listadas arriba.
    No devuelvas explicaciones, no devuelvas texto extra.
  `;

  try {
    const response = await fetch(URL_GEMINI, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.2,
          responseMimeType: "application/json"
        }
      })
    });

    const data = await response.json();
    console.log("Respuesta IA:", data);

    const textResult = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    const json = JSON.parse(textResult);

    const categoria = json.categoria;

    if (!categoria) {
      alert("No se pudo identificar la categoría.");
      return;
    }

    // URL de tu catálogo (PROYECTO DEPLOYADO EN VERCEL)
    const URL_BASE = "https://agroinsumos-san-pedro-despliegue-us-tau.vercel.app";

    const destino = `${URL_BASE}/inven.html?categoria=${categoria}`;

    console.log("Redirigiendo a:", destino);
    window.location.href = destino;

  } catch (error) {
    console.error("Error con IA:", error);
    alert("Ocurrió un error al procesar la búsqueda.");
  }
}
