fetch("../leaves_loader.html")
    .then(res => res.text())
    .then(html => {
        document.getElementById("loader").innerHTML = html;

        // Ahora sí existen .leaf
        const leaves = document.querySelectorAll('.leaf');

        if (leaves.length > 0) {
            console.log("SE TIENE QUE MOVER", leaves);

            function startLoader() {
                oneTurn();
                setInterval(() => {
                    oneTurn();
                    leaves[leaves.length - 1].style.fill = '#FFFFFF';
                }, 1800);
            }

            function oneTurn() {
                for (let i = 0; i < leaves.length; i++) {
                    setTimeout(() => {
                        if (i > 0) {
                            leaves[i - 1].style.fill = '#FFFFFF';
                        }
                        leaves[i].style.fill = '#528d5c';
                    }, i * 300);
                }
            }

            startLoader();
        }
    });
