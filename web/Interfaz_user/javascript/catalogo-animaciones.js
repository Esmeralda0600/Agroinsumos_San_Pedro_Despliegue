/* ============================================================
   Archivo: catalogo-animaciones.js
   Descripción: Controla la generación dinámica del catálogo de
                productos, marcas e ingredientes activos.
   Autor: [Tu Nombre o Equipo]
   Fecha: [10/11/2025]
   Cumple con el estándar de codificación JS institucional.
   ============================================================ */

/* ==================== 1. Definición de datos ==================== */

/**
 * Arreglo de productos principales
//  */
// const productos = [
//   { nombre: "SEMILLAS", img: "imgs/semillas.jpg" },
//   { nombre: "FERTILIZANTES", img: "imgs/fertilizantes.jpg" },
//   { nombre: "HERBICIDAS", img: "imgs/herbicidas.jpg" },
//   { nombre: "ADHERENTE", img: "imgs/adherentes.jpg" }
// ];

// /**
//  * Arreglo de marcas disponibles
//  */
// const marcas = [
//   { nombre: "BAYER", img: "imgs/bayer.jpg" },
//   { nombre: "SYNGENTA", img: "imgs/sygenta.jpg" },
//   { nombre: "ULTRASOL", img: "imgs/ultrasol.jpg" },
//   { nombre: "AGROENZYMAS", img: "imgs/agroenzymas.jpg" }
// ];

// /**
//  * Arreglo de ingredientes activos
//  */
// const ingredientes = [
//   { nombre: "GLIFOSATO", img: "imgs/glifosato.jpg" },
//   { nombre: "ATRAZINA", img: "imgs/atrazina.jpg" },
//   { nombre: "IMIDACLOPRID", img: "imgs/imidacloprid.jpg" },
//   { nombre: "PARAQUAT", img: "imgs/paraquat.jpg" }
// ];

/* ==================== 2. Elementos del DOM ==================== */


/* ==================== 3. Función principal ==================== */

/**
 * Genera las tarjetas dinámicamente según la lista seleccionada.
 * @param {Array} lista - Lista de objetos (productos/marcas/ingredientes)
 * @param {string} tituloTexto - Título que se mostrará en pantalla
 */
export function mostrarTarjetas(lista, tituloTexto) {
    /** Contenedor de las tarjetas */
  const contenedor = document.getElementById("contenedor-tarjetas");

  /** Encabezado principal del catálogo */
  const titulo = document.getElementById("titulo-catalogo");

  // Limpia el contenedor y actualiza el encabezado
  contenedor.innerHTML = "";
  titulo.textContent = tituloTexto;

  // Crea cada tarjeta con su imagen y texto
  lista.forEach((item) => {
    const tarjeta = document.createElement("div");
    tarjeta.classList.add("tarjeta");
    tarjeta.style.backgroundImage = `url('${item.img}')`;

    tarjeta.innerHTML = `
      <div class="overlay">
        <p>${item.nombre}</p>
      </div>
    `;

    // Agregar comportamiento especial: redirigir si es "SEMILLAS"
    if (item.nombre.toUpperCase() === "SEMILLAS") {
      tarjeta.style.cursor = "pointer";
      tarjeta.addEventListener("click", () => {
        window.location.href = "inven.html";
      });
    }

    // Insertar la tarjeta en el contenedor principal
    contenedor.appendChild(tarjeta);
  });
}

/* ==================== 4. Inicialización ==================== */

/**
//  * Muestra por defecto el catálogo de productos al cargar la página
//  */
// mostrarTarjetas(productos, "CATÁLOGO DE PRODUCTOS");

// /* ==================== 5. Listeners de los filtros ==================== */

// /**
//  * Escucha los cambios en las opciones de filtro y actualiza el catálogo.
//  */
// document
//   .querySelectorAll("input[name='tipo-busqueda']")
//   .forEach((radio) => {
//     radio.addEventListener("change", (event) => {
//       const tipo = event.target.value;

//       switch (tipo) {
//         case "producto":
//           mostrarTarjetas(productos, "CATÁLOGO DE PRODUCTOS");
//           break;
//         case "marca":
//           mostrarTarjetas(marcas, "CATÁLOGO POR MARCA");
//           break;
//         case "ingrediente":
//           mostrarTarjetas(ingredientes, "CATÁLOGO POR INGREDIENTE ACTIVO");
//           break;
//       }
//     });
//   });
