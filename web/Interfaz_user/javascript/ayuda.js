document.addEventListener('DOMContentLoaded', () => {
    //Seleccionar todos los elementos de pregunta
    const faqQuestions = document.querySelectorAll('.faq-question');

    //Iterar sobre cada pregunta
    faqQuestions.forEach(question => {
        //Añadir un "escuchador de eventos" (listener) para el clic
        question.addEventListener('click', () => {
            // Obtener la respuesta asociada (el elemento justo después de la pregunta)
            const answer = question.nextElementSibling;

            // Alternar la clase 'active' en la pregunta
            // Esto activa/desactiva los estilos en CSS
            question.classList.toggle('active');

            //Cerrar otras respuestas al abrir una nueva
            
            faqQuestions.forEach(otherQuestion => {
                // Si la otra pregunta no es la pregunta actual y está activa
                if (otherQuestion !== question && otherQuestion.classList.contains('active')) {
                    otherQuestion.classList.remove('active');
                    // Ocultar la respuesta asociada a la otra pregunta
                    otherQuestion.nextElementSibling.style.maxHeight = '0';
                    otherQuestion.nextElementSibling.style.paddingBottom = '0';
                }
            });
            
            // Manejar la expansión o colapso de la respuesta
            if (question.classList.contains('active')) {
                // Si está activa, forzar a que se despliegue si el CSS no lo hace automáticamente
                // NOTA: Con max-height en el CSS ya no es estrictamente necesario,
                // pero ayuda a asegurar que el elemento tenga espacio.
                answer.style.maxHeight = answer.scrollHeight + 50 + "px";
            } else {
                // Si no está activa, colapsar
                answer.style.maxHeight = '0';
            }
        });
    });
});