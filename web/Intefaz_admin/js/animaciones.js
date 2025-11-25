// ==================== CARRUSEL ====================
let indiceSlide = 1;
mostrarSlides(indiceSlide);

function cambiarSlide(n) {
    mostrarSlides(indiceSlide += n);
}

function irASlide(n) {
    mostrarSlides(indiceSlide = n);
}

function mostrarSlides(n) {
    let i;
    let slides = document.getElementsByClassName("slide");
    let dots = document.getElementsByClassName("dot");
    if (n > slides.length) { indiceSlide = 1 }
    if (n < 1) { indiceSlide = slides.length }
    for (i = 0; i < slides.length; i++) {
        slides[i].style.display = "none";
    }
    for (i = 0; i < dots.length; i++) {
        dots[i].className = dots[i].className.replace(" active", "");
    }
    slides[indiceSlide - 1].style.display = "block";
    dots[indiceSlide - 1].className += " active";
}

/* Auto-cambio cada 5 segundos */
setInterval(() => cambiarSlide(1), 5000);

