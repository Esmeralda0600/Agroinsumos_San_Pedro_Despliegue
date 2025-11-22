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

  // Reinicia índice si supera límites
  if (n > slides.length) {
    indiceSlide = 1;
  }
  if (n < 1) {
    indiceSlide = slides.length;
  }

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
