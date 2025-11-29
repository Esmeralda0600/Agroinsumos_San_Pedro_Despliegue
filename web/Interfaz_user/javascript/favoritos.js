// ============================================================
// FAVORITOS.HTML – sincronizado con inventario
// ============================================================

const API_URL = "https://agroinsumos-san-pedro-despliegue.onrender.com";


// ============================================================
// 1. Recibir eliminación desde inven.html
// ============================================================
if (localStorage.getItem("actualizarFavoritos") === "1") {

    const eliminado = localStorage.getItem("productoEliminado");

    let favsLS = JSON.parse(localStorage.getItem("favoritosLS")) || [];
    favsLS = favsLS.filter(f => f.id !== eliminado);
    localStorage.setItem("favoritosLS", JSON.stringify(favsLS));

    localStorage.removeItem("actualizarFavoritos");
    localStorage.removeItem("productoEliminado");

    location.reload();
}


// ============================================================
// 2. Cargar favoritos del backend
// ============================================================
document.addEventListener("DOMContentLoaded", async () => {

    const usuarioId = localStorage.getItem("usuarioId");
    const lista = document.getElementById("lista-favoritos");
    const total = document.getElementById("total-favoritos");

    if (!usuarioId) {
        lista.innerHTML = `<p>Debes iniciar sesión.</p>`;
        return;
    }

    const resp = await fetch(`${API_URL}/favoritos/${usuarioId}`);
    const data = await resp.json();
    const favoritos = data.favoritos || [];

    lista.innerHTML = "";

    if (favoritos.length === 0) {
        lista.innerHTML = `<p class="sin-favoritos">No tienes favoritos aún.</p>`;
        total.textContent = "0 productos";
        return;
    }

    favoritos.forEach(f => {
        const idProducto = String(f.producto.id_producto);

        const card = document.createElement("article");
        card.classList.add("item-carrito");

        card.innerHTML = `
            <img src="${f.imagen || 'imgs/ingrediente.png'}" class="producto-img">

            <div class="info-producto-carrito">
                <h3>${f.nombre}</h3>
                <p>Precio: $${f.precio}</p>
            </div>

            <button class="btn-eliminar"
                    data-idfav="${f._id}"
                    data-productoid="${idProducto}">
                Eliminar
            </button>
        `;

        lista.appendChild(card);
    });

    total.textContent = `${favoritos.length} productos`;


    // ============================================================
    // 3. Eliminar desde favoritos.html
    // ============================================================
    document.querySelectorAll(".btn-eliminar").forEach(btn => {
        btn.addEventListener("click", async () => {

            const idFav = btn.dataset.idfav;
            const idProd = btn.dataset.productoid;

            // backend
            await fetch(`${API_URL}/favoritos/${idFav}`, { method: "DELETE" });

            // localStorage
            let favsLS = JSON.parse(localStorage.getItem("favoritosLS")) || [];
            favsLS = favsLS.filter(f => f.id !== idProd);
            localStorage.setItem("favoritosLS", JSON.stringify(favsLS));

            // avisar a inventario
            localStorage.setItem("actualizarInventario", "1");
            localStorage.setItem("productoEliminado", idProd);

            btn.closest(".item-carrito").remove();
        });
    });

});
