/* ============================================================
 * AGROINSUMOS SAN PEDRO
 * Archivo: animaciones.js
 * Descripción: Control de carrusel automático y manual
 * Cumple con el estándar de codificación JavaScript institucional
 * ============================================================ */

// Índice actual del slide
let indiceSlide = 1;

// Inicialización del carrusel
mostrarSlides(indiceSlide);

/* -----------------------------------------------------------------
 * # FUNCIONES DE CONTROL DE SLIDES
 * ----------------------------------------------------------------- */

/**
 * Cambia de slide hacia adelante o atrás.
 * @param {number} n - Número de posición relativa (1 siguiente, -1 anterior)
 */
function cambiarSlide(n) {
  mostrarSlides(indiceSlide += n);
}

/**
 * Muestra el slide correspondiente al número indicado.
 * @param {number} n - Índice del slide a mostrar
 */
function irASlide(n) {
  mostrarSlides(indiceSlide = n);
}

/**
 * Función principal que muestra el slide activo y oculta los demás.
 * @param {number} n - Índice actual de slide
 */
function mostrarSlides(n) {
  const slides = document.getElementsByClassName('carrusel__slide');
  const dots = document.getElementsByClassName('carrusel__dot');

  if (n > slides.length) indiceSlide = 1;
  if (n < 1) indiceSlide = slides.length;

  // Oculta todos los slides
  for (let i = 0; i < slides.length; i++) {
    slides[i].style.display = 'none';
  }

  // Quita la clase activa de los puntos
  for (let i = 0; i < dots.length; i++) {
    dots[i].className = dots[i].className.replace(' carrusel__dot--active', '');
  }

  // Muestra el slide activo y activa el punto correspondiente
  slides[indiceSlide - 1].style.display = 'block';
  dots[indiceSlide - 1].className += ' carrusel__dot--active';
}

/* -----------------------------------------------------------------
 * # AUTO-REPRODUCCIÓN DEL CARRUSEL
 * ----------------------------------------------------------------- */

// Cambia automáticamente de slide cada 5 segundos
setInterval(() => {
  cambiarSlide(1);
}, 5000);


/* ============================================================
   BUSCADOR INTELIGENTE CON IA PARA REDIRECCIÓN DE CATEGORÍAS
   ============================================================ */

// ⚠️ EDITA ESTA LÍNEA — TU BACKEND EN RENDER
const URL_BACKEND_IA = "https://TU_BACKEND_RENDER/api/ia/interpretar"; 
// Ejemplo real: https://agroinsumos-san-pedro-despliegue.onrender.com/api/ia/interpretar

// Eventos del buscador
document.getElementById("btn-buscar-ia").addEventListener("click", interpretarBusqueda);
document.getElementById("input-busqueda").addEventListener("keypress", e => {
  if (e.key === "Enter") interpretarBusqueda();
});

/**
 * Ejecuta la búsqueda inteligente con IA
 */
async function interpretarBusqueda() {
  const texto = document.getElementById("input-busqueda").value.trim();

  if (!texto) {
    alert("Por favor escribe lo que deseas buscar.");
    return;
  }

  console.log("Consultando IA para:", texto);

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

    // URL del catálogo desplegado
    const URL_BASE = "https://agroinsumos-san-pedro-despliegue-us-tau.vercel.app";
    const destino = `${URL_BASE}/inven.html?categoria=${categoria}`;

    console.log("Redirigiendo a:", destino);
    window.location.href = destino;

  } catch (error) {
    console.error("Error con IA:", error);
    alert("Ocurrió un error al procesar la búsqueda.");
  }
}
