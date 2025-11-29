// ============================================================
// FAVORITOS.HTML – SINCRONIZADO CON INVENTARIO Y BACKEND
// ============================================================

const API_URL = "https://agroinsumos-san-pedro-despliegue.onrender.com";


// ============================================================
// 1. Si inven.html eliminó un favorito → limpiar flags
// ============================================================
if (localStorage.getItem("actualizarFavoritos") === "1") {
    // OJO: en inven ya se actualizó favoritosLS,
    // aquí solo tenemos que limpiar banderas
    localStorage.removeItem("actualizarFavoritos");
    localStorage.removeItem("productoEliminado");
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
        let favoritos = data.favoritos || [];

        // 🧠 Aplicar filtro por localStorage → si en inven ya lo quitaste, no se muestra
        const favsLS = JSON.parse(localStorage.getItem("favoritosLS")) || [];

        favoritos = favoritos.filter(f => {
            const prodId = String(
                f.producto?.id_producto ||
                f.productoId ||
                f.id_producto
            );
            return favsLS.some(ls => String(ls.id) === prodId);
        });

        lista.innerHTML = "";

        if (favoritos.length === 0) {
            lista.innerHTML = `<p class="sin-favoritos">No tienes productos favoritos aún.</p>`;
            totalFavoritos.textContent = "0 productos";
            return;
        }

        favoritos.forEach(fav => {
            const prodId = String(
                fav.producto?.id_producto ||
                fav.productoId ||
                fav.id_producto
            );

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
                            data-productoid="${prodId}">
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

                // Backend
                await fetch(`${API_URL}/favoritos/${idFavorito}`, {
                    method: "DELETE"
                });

                // LocalStorage: quitar por id_producto
                let favsLS = JSON.parse(localStorage.getItem("favoritosLS")) || [];
                favsLS = favsLS.filter(p => String(p.id) !== String(idProducto));
                localStorage.setItem("favoritosLS", JSON.stringify(favsLS));

                // Avisar a inven.html para que actualice iconos
                localStorage.setItem("actualizarInventario", "1");
                localStorage.setItem("productoEliminado", String(idProducto));

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
