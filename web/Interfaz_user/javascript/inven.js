/**
 * ============================================================
 * SCRIPT: Manejo de botones "Agregar al carrito" y "Comprar"
 * Proyecto: Agroinsumos San Pedro
 * Cumple con el estándar de codificación HTML/JS/CSS
 * ============================================================
 */

/* ==================== BOTONES: AGREGAR AL CARRITO ==================== */
const botonesAgregar = document.querySelectorAll(".btn:not(.comprar)");

botonesAgregar.forEach((boton) => {
  boton.addEventListener("click", (evento) => {
    const tarjeta = evento.target.closest(".tarjeta");
    const nombre = tarjeta.querySelector("h3").innerText;
    const precio = parseFloat(
      tarjeta.querySelector("p").innerText.replace("$", "")
    );
    const imagen = tarjeta.querySelector("img").src;

    // Obtener carrito desde localStorage o crear uno nuevo
    const carrito = JSON.parse(localStorage.getItem("carrito")) || [];

    // Buscar si el producto ya existe en el carrito
    const productoExistente = carrito.find((p) => p.nombre === nombre);

    if (productoExistente) {
      productoExistente.cantidad += 1;
    } else {
      carrito.push({ nombre, precio, imagen, cantidad: 1 });
    }

    // Guardar carrito actualizado en localStorage
    localStorage.setItem("carrito", JSON.stringify(carrito));

    // Redirigir al carrito
    window.location.href = "carrito.html";
  });
});

/* ==================== BOTONES: COMPRAR AHORA ==================== */
const botonesComprar = document.querySelectorAll(".comprar");

botonesComprar.forEach((boton) => {
  boton.addEventListener("click", (evento) => {
    const tarjeta = evento.target.closest(".tarjeta");
    const nombre = tarjeta.querySelector("h3").innerText;
    const precio = parseFloat(
      tarjeta.querySelector("p").innerText.replace("$", "")
    );
    const imagen = tarjeta.querySelector("img").src;

    // Agregar producto directamente al carrito
    const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
    carrito.push({ nombre, precio, imagen, cantidad: 1 });
    localStorage.setItem("carrito", JSON.stringify(carrito));

    // Redirigir para finalizar la compra
    window.location.href = "semillas.html";
  });
});
