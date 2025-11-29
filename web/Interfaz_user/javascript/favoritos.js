// ============================================================
// FAVORITOS.HTML – SINCRONIZADO CON INVENTARIO Y BACKEND
// ============================================================

const API_URL = "https://agroinsumos-san-pedro-despliegue.onrender.com";


// ============================================================
// 1. Si inven.html eliminó un favorito → sincronizar aquí
// ============================================================
if (localStorage.getItem("actualizarFavoritos") === "1") {

    const idEliminado = localStorage.getItem("productoEliminado");

    if (idEliminado) {
        let favsLS = JSON.parse(localStorage.getItem("favoritosLS")) || [];
        favsLS = favsLS.filter(p => p.id !== idEliminado);
        localStorage.setItem("favoritosLS", JSON.stringify(favsLS));
    }

    localStorage.removeItem("actualizarFavoritos");
    localStorage.removeItem("productoEliminado");

    location.reload();
}


// ============================================================
// 2. CARGA DE FAVORITOS.HTML
// ============================================================
document.addEventListener("DOMContentLoaded", async () => {

    const usuarioId = localStorage.getItem("usuarioId");
    const lista = document.getElementById("lista-favoritos");
    const totalFavoritos = document.getElementById("total-favoritos");

    if (!usuarioId) {
        lista.innerHTML = `<p class="sin-sesion">Debes iniciar sesión para ver tus favoritos.</p>`;
        return;
    }

    try {
        const resp = await fetch(`${API_URL}/favoritos/${usuarioId}`);
        const data = await resp.json();
        const favoritos = data.favoritos || [];

        lista.innerHTML = "";

        if (favoritos.length === 0) {
            lista.innerHTML = `<p class="sin-favoritos">No tienes productos favoritos aún.</p>`;
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
                            data-productoid="${fav.producto?.id_producto}">
                        Eliminar
                    </button>
                </div>
            `;

            lista.appendChild(articulo);
        });

        totalFavoritos.textContent = `${favoritos.length} productos`;


        // ============================================================
        // 3. ELIMINAR FAVORITO DESDE favoritos.html
        // ============================================================
        document.querySelectorAll(".btn-eliminar").forEach(btn => {
            btn.addEventListener("click", async () => {

                const idFavorito = btn.dataset.id;
                const idProducto = btn.dataset.productoid;

                // Borrar del backend
                await fetch(`${API_URL}/favoritos/${idFavorito}`, {
                    method: "DELETE"
                });

                // Eliminar del LS usando ID REAL
                let favsLS = JSON.parse(localStorage.getItem("favoritosLS")) || [];
                favsLS = favsLS.filter(p => p.id !== idProducto);
                localStorage.setItem("favoritosLS", JSON.stringify(favsLS));

                // Avisar al inventario
                localStorage.setItem("actualizarInventario", "1");
                localStorage.setItem("productoEliminado", idProducto);

                // Quitar visualmente
                btn.closest(".item-carrito").remove();

                const restantes = document.querySelectorAll(".item-carrito").length;
                totalFavoritos.textContent = `${restantes} productos`;
            });
        });

    } catch (err) {
        console.error("ERROR FAVORITOS:", err);
        lista.innerHTML = "<p>Error al cargar tus favoritos.</p>";
    }
});
