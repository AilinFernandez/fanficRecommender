document.addEventListener("DOMContentLoaded", () => {
    const elementsToAnimate = document.querySelectorAll(".ComoFunciona, .popular-cards"); // Selecciona ambas secciones

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("visible"); // Agrega la clase visible
                } else {
                    entry.target.classList.remove("visible"); // Opcional: quita la clase si sale del viewport
                }
            });
        },
        { threshold: 0.2 } // Se activa cuando el 20% de la sección es visible
    );

    elementsToAnimate.forEach((element) => observer.observe(element)); // Observa cada sección
});

/*
document.addEventListener("DOMContentLoaded", () => {
    const track = document.querySelector(".carousel-track");
    const prevButton = document.querySelector(".carousel-button.prev");
    const nextButton = document.querySelector(".carousel-button.next");
    const cards = document.querySelectorAll(".carousel-card");
    const cardWidth = cards[0].offsetWidth; // Ancho de una tarjeta
    let currentIndex = 0;

    // Clonar el primer y último elemento para el efecto de loop
    const firstClone = cards[0].cloneNode(true);
    const lastClone = cards[cards.length - 1].cloneNode(true);

    track.appendChild(firstClone); // Agregar el primer elemento al final
    track.insertBefore(lastClone, cards[0]); // Agregar el último elemento al principio

    const updatePosition = () => {
        track.style.transform = `translateX(-${(currentIndex + 1) * cardWidth}px)`;
    };

    // Inicializar la posición al primer elemento
    currentIndex = 0;
    updatePosition();

    nextButton.addEventListener("click", () => {
        if (currentIndex >= cards.length - 1) {
            currentIndex = 0;
            track.style.transition = "none"; // Deshabilitar transición para el salto
            updatePosition();
            setTimeout(() => {
                track.style.transition = "transform 0.5s ease-in-out"; // Rehabilitar transición
                currentIndex++;
                updatePosition();
            }, 50);
        } else {
            currentIndex++;
            updatePosition();
        }
    });

    prevButton.addEventListener("click", () => {
        if (currentIndex <= 0) {
            currentIndex = cards.length - 1;
            track.style.transition = "none"; // Deshabilitar transición para el salto
            updatePosition();
            setTimeout(() => {
                track.style.transition = "transform 0.5s ease-in-out"; // Rehabilitar transición
                currentIndex--;
                updatePosition();
            }, 50);
        } else {
            currentIndex--;
            updatePosition();
        }
    });

    // Ajustar el tamaño del track para incluir los clones
    track.style.width = `${(cards.length + 2) * cardWidth}px`;
});
*/
document.addEventListener("DOMContentLoaded", () => {
    const track = document.querySelector(".carousel-track");
    const prevButton = document.querySelector(".carousel-button.prev");
    const nextButton = document.querySelector(".carousel-button.next");
    let cards = document.querySelectorAll(".carousel-card");
    const cardWidth = cards[0].offsetWidth;
    let currentIndex = 0;

    // Clonar el primer y último elemento
    const firstClone = cards[0].cloneNode(true);
    const lastClone = cards[cards.length - 1].cloneNode(true);

    track.appendChild(firstClone);
    track.insertBefore(lastClone, cards[0]);

    // Actualizar la lista de tarjetas
    cards = document.querySelectorAll(".carousel-card");

    const updatePosition = () => {
        track.style.transition = "transform 0.5s ease-in-out";
        track.style.transform = `translateX(-${(currentIndex + 1) * cardWidth}px)`;
    };

    // Ajustar el tamaño del track
    track.style.width = `${cards.length * cardWidth}px`;

    // Inicializar la posición
    updatePosition();

    nextButton.addEventListener("click", () => {
        if (currentIndex >= cards.length - 2) {
            currentIndex = 0;
            track.style.transition = "none";
            updatePosition();
            setTimeout(() => {
                track.style.transition = "transform 0.5s ease-in-out";
                currentIndex++;
                updatePosition();
            }, 50);
        } else {
            currentIndex++;
            updatePosition();
        }
    });

    prevButton.addEventListener("click", () => {
        if (currentIndex <= 0) {
            currentIndex = cards.length - 2;
            track.style.transition = "none";
            updatePosition();
            setTimeout(() => {
                track.style.transition = "transform 0.5s ease-in-out";
                currentIndex--;
                updatePosition();
            }, 50);
        } else {
            currentIndex--;
            updatePosition();
        }
    });
});
