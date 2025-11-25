function filtrarTabla() {
    const texto = document.getElementById("buscar").value.toLowerCase();
    const categoria = document.getElementById("categoria").value;
    const filas = document.querySelectorAll(".tabla-inventario tbody tr");

    let visibles = 0;

    filas.forEach(fila => {
        const nombre = fila.children[0].innerText.toLowerCase();
        const categoriaFila = fila.getAttribute("data-categoria");

        const coincideTexto = nombre.includes(texto);
        const coincideCategoria = categoria === "todo" || categoria === categoriaFila;

        if (coincideTexto && coincideCategoria) {
            fila.style.display = "";
            visibles++;
        } else {
            fila.style.display = "none";
        }
    });

    return visibles;
}

// Detectar cuando el usuario presiona ENTER en el buscador
document.getElementById("buscar").addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
        event.preventDefault(); // evita recargar la página

        const resultados = filtrarTabla(); // ejecuta el filtro

        if (resultados === 0) {
            alert("No se encontraron productos con ese nombre o categoría.");
        }
    }
});

document.getElementById("categoria").addEventListener("change", function() {
    const resultados = filtrarTabla();

    if (resultados === 0) {
        alert("Actualmente no hay productos disponibles en esta categoría.");
    }
});


