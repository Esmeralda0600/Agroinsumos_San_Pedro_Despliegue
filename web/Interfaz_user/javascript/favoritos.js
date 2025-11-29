// ============================================================
// FAVORITOS.HTML – BASADO EN BACKEND REAL
// ============================================================

const API_URL = "https://agroinsumos-san-pedro-despliegue.onrender.com";


// ============================================================
// 1. Si inven.html eliminó ⇒ sincronizar aquí
// ============================================================
if (localStorage.getItem("actualizarFavoritos") === "1") {

    const nombreEliminado = localStorage.getItem("productoEliminado");

    if (nombreEliminado) {
        let favsLS = JSON.parse(localStorage.getItem("favoritosLS")) || [];

        // ❗ Backend NO envía ID, solo nombre
        favsLS = favsLS.filter(f => f.nombre !== nombreEliminado);

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
        lista.innerHTML = `<p>Debes iniciar sesión para ver tus favoritos.</p>`;
        return;
    }

    try {
        const resp = await fetch(`${API_URL}/favoritos/${usuarioId}`);
        const data = await resp.json();

        const favoritos = data.favoritos || [];

        lista.innerHTML = "";

        if (favoritos.length === 0) {
            lista.innerHTML = `<p>No tienes productos favoritos aún.</p>`;
            totalFavoritos.textContent = "0 productos";
            return;
        }

        favoritos.forEach(fav => {
            const item = document.createElement("article");
            item.classList.add("item-carrito");

            item.innerHTML = `
                <img src="${fav.imagen}" class="producto-img">

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

            lista.appendChild(item);
        });

        totalFavoritos.textContent = `${favoritos.length} productos`;


        // ============================================================
        // 3. ELIMINAR FAVORITO DESDE favoritos.html
        // ============================================================
        document.querySelectorAll(".btn-eliminar").forEach(btn => {

            btn.addEventListener("click", async () => {

                const idFavorito = btn.dataset.id;
                const nombre = btn.dataset.nombre;

                // Backend
                await fetch(`${API_URL}/favoritos/${idFavorito}`, {
                    method: "DELETE"
                });

                // LocalStorage por nombre (backend NO envía id_producto)
                let favsLS = JSON.parse(localStorage.getItem("favoritosLS")) || [];
                favsLS = favsLS.filter(f => f.nombre !== nombre);
                localStorage.setItem("favoritosLS", JSON.stringify(favsLS));

                // Avisar al inventario que quite el corazón
                localStorage.setItem("actualizarInventario", "1");
                localStorage.setItem("productoEliminado", nombre);

                // Quitar visualmente
                btn.closest(".item-carrito").remove();

                const count = document.querySelectorAll(".item-carrito").length;
                totalFavoritos.textContent = `${count} productos`;
            });
        });


    } catch (err) {
        console.error("ERROR FAVORITOS:", err);
        lista.innerHTML = "<p>Error cargando favoritos.</p>";
    }
});
