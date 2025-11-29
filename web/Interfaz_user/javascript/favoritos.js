// ============================================================
// FAVORITOS.HTML – SINCRONIZADO CON INVENTARIO Y BACKEND
// ============================================================

const API_URL = "https://agroinsumos-san-pedro-despliegue.onrender.com";

// 🚀 1. Sincronizar cuando INVENTARIO elimina un favorito
if (localStorage.getItem("actualizarInventario") === "1") {

    const nombreEliminado = localStorage.getItem("productoEliminado");

    if (nombreEliminado) {
        let favsLS = JSON.parse(localStorage.getItem("favoritosLS")) || [];
        favsLS = favsLS.filter(n => n !== nombreEliminado);
        localStorage.setItem("favoritosLS", JSON.stringify(favsLS));
    }

    localStorage.removeItem("actualizarInventario");
    localStorage.removeItem("productoEliminado");

    location.reload();
}


// 🚀 2. FAVORITOS.HTML CARGA INICIAL
document.addEventListener("DOMContentLoaded", async () => {

    const usuarioId = localStorage.getItem("usuarioId");
    const lista = document.getElementById("lista-favoritos");
    const totalFavoritos = document.getElementById("total-favoritos");

    if (!usuarioId) {
        lista.innerHTML = `<p class="sin-sesion">Debes iniciar sesión para ver tus favoritos.</p>`;
        return;
    }

    try {
        // Obtener favoritos desde el backend
        const resp = await fetch(`${API_URL}/favoritos/${usuarioId}`);
        const data = await resp.json();
        const favoritos = data.favoritos || [];

        lista.innerHTML = "";

        if (favoritos.length === 0) {
            lista.innerHTML = `<p class="sin-favoritos">No tienes productos favoritos aún.</p>`;
            totalFavoritos.textContent = "0 productos";
            return;
        }

        // Construcción visual de cada favorito
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
                            data-nombre="${fav.nombre}">
                        Eliminar
                    </button>
                </div>
            `;

            lista.appendChild(articulo);
        });

        totalFavoritos.textContent = `${favoritos.length} productos`;

        // 🚀 3. BOTONES ELIMINAR
        document.querySelectorAll(".btn-eliminar").forEach(btn => {
            btn.addEventListener("click", async () => {
                const idFavorito = btn.dataset.id;
                const nombreProducto = btn.dataset.nombre;

                // ELIMINAR EN BACKEND
                await fetch(`${API_URL}/favoritos/${idFavorito}`, {
                    method: "DELETE"
                });

                // ELIMINAR DEL LOCALSTORAGE
                let favsLS = JSON.parse(localStorage.getItem("favoritosLS")) || [];
                favsLS = favsLS.filter(n => n !== nombreProducto);
                localStorage.setItem("favoritosLS", JSON.stringify(favsLS));

                // NOTIFICAR INVENTARIO
                localStorage.setItem("actualizarInventario", "1");
                localStorage.setItem("productoEliminado", nombreProducto);

                // QUITAR VISUALMENTE
                btn.closest(".item-carrito").remove();

                // ACTUALIZAR CONTADOR
                const restantes = document.querySelectorAll(".item-carrito").length;
                totalFavoritos.textContent = `${restantes} productos`;
            });
        });

    } catch (err) {
        console.error("ERROR FAVORITOS:", err);
        lista.innerHTML = "<p>Error al cargar tus favoritos.</p>";
    }
});
