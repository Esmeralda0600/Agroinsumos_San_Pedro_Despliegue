// ==========================
//  CARGAR CARRITO POR USUARIO
// ==========================
const contenedor = document.getElementById("contenedor-carrito");

const usuarioId = localStorage.getItem("usuarioId");
let carrito = JSON.parse(localStorage.getItem(`carrito_${usuarioId}`)) || [];

renderizarCarrito();

// ==========================
//  RENDERIZAR CARRITO
// ==========================
function renderizarCarrito() {
    contenedor.innerHTML = "";

    if (carrito.length === 0) {
        contenedor.innerHTML = "<p>Tu carrito está vacío.</p>";
        actualizarResumen(0);
        return;
    }

    let subtotalTotal = 0;

    carrito.forEach((producto, index) => {
        const subtotal = producto.precio * producto.cantidad;
        subtotalTotal += subtotal;

        const item = document.createElement("div");
        item.classList.add("item-carrito");

        item.innerHTML = `
            <img src="${producto.imagen}" alt="${producto.nombre}">

            <div class="info-producto-carrito">
                <h3>${producto.nombre}</h3>
                <p>Precio: $${producto.precio.toFixed(2)}</p>

                <div class="cantidad">
                    <label>Cantidad:</label>
                    <input 
                        type="number" 
                        min="1"
                        value="${producto.cantidad}" 
                        data-index="${index}" 
                        class="input-cantidad">
                </div>
            </div>

            <div class="acciones-item">
                <p class="subtotal">Subtotal: $${subtotal.toFixed(2)}</p>
                <button class="btn-eliminar" data-index="${index}">Eliminar</button>
            </div>
        `;

        contenedor.appendChild(item);
    });

    actualizarResumen(subtotalTotal);
    agregarEventos();
}

// ==========================
//  ACTUALIZAR RESUMEN 
// ==========================
function actualizarResumen(subtotal) {
    const total = subtotal;

    document.querySelector('.resumen-compra p:nth-of-type(1) span')
        .innerText = `$${subtotal.toFixed(2)}`;

    document.querySelector('.resumen-compra p:nth-of-type(2) span')
        .innerText = `$0.00`;

    document.querySelector('.resumen-compra .total')
        .innerText = `$${total.toFixed(2)}`;
}

// ==========================
//  EVENTOS
// ==========================
function agregarEventos() {

    // 🔥 ELIMINAR PRODUCTO
    document.querySelectorAll(".btn-eliminar").forEach(btn => {
        btn.addEventListener("click", () => {
            const index = btn.dataset.index;

            carrito.splice(index, 1);
            localStorage.setItem(`carrito_${usuarioId}`, JSON.stringify(carrito));
            renderizarCarrito();
        });
    });

    // 🔥 CAMBIAR CANTIDAD
    document.querySelectorAll(".input-cantidad").forEach(input => {
        input.addEventListener("change", () => {

            const index = input.dataset.index;
            let cantidad = parseInt(input.value);

            if (cantidad < 1) cantidad = 1;

            carrito[index].cantidad = cantidad;

            localStorage.setItem(`carrito_${usuarioId}`, JSON.stringify(carrito));
            renderizarCarrito();
        });
    });
}

// ==========================
//  FINALIZAR COMPRA
// ==========================
document.querySelector(".btn-finalizar").addEventListener("click", () => {
    window.location.href = "pago.html";
});
