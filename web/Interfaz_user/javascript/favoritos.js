// ============================================================
// FAVORITOS.HTML — TOTALMENTE COMPATIBLE CON BACKEND + logica.js
// ============================================================

const API_URL = "https://agroinsumos-san-pedro-despliegue.onrender.com";


// ============================================================
// 1. SINCRONIZAR si inven.html eliminó algo
// ============================================================
if (localStorage.getItem("actualizarFavoritos") === "1") {

    const eliminado = localStorage.getItem("productoEliminado");

    if (eliminado) {
        let favsLS = JSON.parse(localStorage.getItem("favoritosLS")) || [];

        // eliminar por ID (la forma correcta)
        favsLS = favsLS.filter(f => String(f.id) !== String(eliminado));

        localStorage.setItem("favoritosLS", JSON.stringify(favsLS));
    }

    localStorage.removeItem("actualizarFavoritos");
    localStorage.removeItem("productoEliminado");

    location.reload();
}



// ============================================================
// 2. CARGAR FAVORITOS DEL BACKEND
// ============================================================
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

        // Mostrar cada favorito
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



        // ============================================================
        // 3. ELIMINAR DESDE FAVORITOS.HTML
        // ============================================================
        document.querySelectorAll(".btn-eliminar").forEach(btn => {

            btn.addEventListener("click", async () => {

                const idFavoritoMongo = btn.dataset.id;
                const idProducto = btn.dataset.producto; // ID REAL DEL PRODUCTO

                // 1. Eliminar en backend
                await fetch(`${API_URL}/favoritos/${idFavoritoMongo}`, {
                    method: "DELETE"
                });

                // 2. Eliminar en localStorage
                let favsLS = JSON.parse(localStorage.getItem("favoritosLS")) || [];
                favsLS = favsLS.filter(f => String(f.id) !== String(idProducto));
                localStorage.setItem("favoritosLS", JSON.stringify(favsLS));

                // 3. Notificar INVENTARIO
                localStorage.setItem("actualizarInventario", "1");
                localStorage.setItem("productoEliminado", idProducto);

                // 4. Borrar de pantalla
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
