// ============================================================
// FAVORITOS.HTML — SOLO SE EJECUTA EN FAVORITOS.HTML
// ============================================================

// Solo correr si estamos en favoritos.html
if (document.getElementById("lista-favoritos")) {

    // 1. Evitar que inven.html ejecute esta sincronización
    if (localStorage.getItem("actualizarFavoritos") === "1") {

        const eliminado = localStorage.getItem("productoEliminado");

        if (eliminado) {
            let favsLS = JSON.parse(localStorage.getItem("favoritosLS")) || [];
            favsLS = favsLS.filter(f => String(f.id) !== String(eliminado));
            localStorage.setItem("favoritosLS", JSON.stringify(favsLS));
        }

        localStorage.removeItem("actualizarFavoritos");
        localStorage.removeItem("productoEliminado");

        location.reload();
    }

    // 2. Cargar favoritos del backend
    document.addEventListener("DOMContentLoaded", async () => {

        const usuarioId = localStorage.getItem("usuarioId");

        const lista = document.getElementById("lista-favoritos");
        const totalFavoritos = document.getElementById("total-favoritos");

        if (!usuarioId) {
            lista.innerHTML = `<p>Debes iniciar sesión.</p>`;
            return;
        }

        try {
            const resp = await fetch(`${API_URL}/favoritos/${usuarioId}`);
            const data = await resp.json();

            const favoritos = data.favoritos || [];

            lista.innerHTML = "";

            if (favoritos.length === 0) {
                lista.innerHTML = `<p class="sin-favoritos">No tienes productos favoritos.</p>`;
                totalFavoritos.textContent = "0 productos";
                return;
            }

            favoritos.forEach(fav => {

                const articulo = document.createElement("article");
                articulo.classList.add("item-carrito");

                articulo.innerHTML = `
                    <img src="${fav.imagen || 'imgs/ingrediente.png'}" class="producto-img">

                    <div class="info-producto-carrito">
                        <h3>${fav.nombre}</h3>
                        <p>Precio: $${fav.precio}</p>
                    </div>

                    <div class="acciones-item">
                        <button class="btn-eliminar"
                                data-id="${fav._id}"
                                data-producto="${fav.producto?.id_producto}">
                            Eliminar
                        </button>
                    </div>
                `;

                lista.appendChild(articulo);
            });

            totalFavoritos.textContent = `${favoritos.length} productos`;

            // 3. Evento eliminar favorito
            document.querySelectorAll(".btn-eliminar").forEach(btn => {

                btn.addEventListener("click", async () => {

                    const idFavoritoMongo = btn.dataset.id;
                    const idProducto = btn.dataset.producto;

                    await fetch(`${API_URL}/favoritos/${idFavoritoMongo}`, {
                        method: "DELETE"
                    });

                    let favsLS = JSON.parse(localStorage.getItem("favoritosLS")) || [];
                    favsLS = favsLS.filter(f => String(f.id) !== String(idProducto));
                    localStorage.setItem("favoritosLS", JSON.stringify(favsLS));

                    localStorage.setItem("actualizarInventario", "1");
                    localStorage.setItem("productoEliminado", idProducto);

                    btn.closest(".item-carrito").remove();

                    const restantes = document.querySelectorAll(".item-carrito").length;
                    totalFavoritos.textContent = `${restantes} productos`;
                });

            });

        } catch (err) {
            console.error("ERROR FAVORITOS:", err);
            lista.innerHTML = "<p>Error al cargar favoritos.</p>";
        }
    });
}
