document.addEventListener("DOMContentLoaded", async () => {

    const lista = document.getElementById("lista-favoritos");
    const totalFavoritos = document.getElementById("total-favoritos");

    // Cargar favoritos desde localStorage
    let favoritos = JSON.parse(localStorage.getItem("favoritosLS")) || [];

    lista.innerHTML = "";

    if (favoritos.length === 0) {
        lista.innerHTML = `<p class="sin-favoritos">No tienes productos favoritos aún.</p>`;
        totalFavoritos.textContent = "0 productos";
        return;
    }

    favoritos.forEach(prod => {
        const articulo = document.createElement("article");
        articulo.classList.add("item-carrito");

        articulo.innerHTML = `
            <img src="${prod.imagen}" class="producto-img">

            <div class="info-producto-carrito">
                <h3>${prod.nombre}</h3>
                <p>Precio: $${prod.precio}</p>
            </div>

            <div class="acciones-item">
                <button class="btn-eliminar" data-id="${prod.id}">Eliminar</button>
            </div>
        `;

        lista.appendChild(articulo);
    });

    totalFavoritos.textContent = `${favoritos.length} productos`;


    // FUNCIONALIDAD DE ELIMINAR FAVORITOS
    document.querySelectorAll(".btn-eliminar").forEach(btn => {
        btn.addEventListener("click", () => {

            const idProducto = btn.dataset.id;

            // Remover del localStorage
            favoritos = favoritos.filter(f => f.id !== idProducto);
            localStorage.setItem("favoritosLS", JSON.stringify(favoritos));

            // Remover del DOM
            btn.closest(".item-carrito").remove();

            const restantes = document.querySelectorAll(".item-carrito").length;
            totalFavoritos.textContent = `${restantes} productos`;
        });
    });

});
