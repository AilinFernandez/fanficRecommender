/*
document.addEventListener("DOMContentLoaded", () => {
    const categorySelect = document.getElementById("category");
    const tagInput = document.getElementById("tag-input");
    const tagsContainer = document.getElementById("tags-container");
    const searchButton = document.getElementById("search-button");
    const resultsDiv = document.getElementById("results");

    let tags = []; // Lista de etiquetas seleccionadas

    // Leer parámetros de la URL
    const params = new URLSearchParams(window.location.search);
    const initialCategory = params.get("category");
    if (initialCategory) {
        categorySelect.value = initialCategory;
        performSearch(); // Realizar la búsqueda inicial
    }

    // Manejar el ingreso de etiquetas
    tagInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && tagInput.value.trim() !== "") {
            e.preventDefault();
            if (tags.length < 10) {
                addTag(tagInput.value.trim());
                tagInput.value = "";
            } else {
                alert("Máximo 10 etiquetas permitidas.");
            }
        }
    });

    function addTag(tag) {
        if (!tags.includes(tag)) {
            tags.push(tag);

            const tagElement = document.createElement("span");
            tagElement.classList.add("tag");
            tagElement.textContent = tag;

            const removeButton = document.createElement("button");
            removeButton.textContent = "×";
            removeButton.classList.add("remove-tag");
            removeButton.addEventListener("click", () => {
                removeTag(tag);
            });

            tagElement.appendChild(removeButton);
            tagsContainer.insertBefore(tagElement, tagInput);
        }
    }

    function removeTag(tag) {
        tags = tags.filter((t) => t !== tag);
        const tagElements = document.querySelectorAll(".tag");
        tagElements.forEach((tagElement) => {
            if (tagElement.textContent.startsWith(tag)) {
                tagsContainer.removeChild(tagElement);
            }
        });
    }

    // Manejar clic en el botón "Buscar"
    searchButton.addEventListener("click", performSearch);

    function performSearch() {
        const category = categorySelect.value;
    
        // Asegúrate de codificar las etiquetas correctamente para la URL
        const tagsParam = encodeURIComponent(tags.join(","));
    
        // Simular una búsqueda en la base de datos
        fetch(`/api/search?category=${encodeURIComponent(category)}&tags=${tagsParam}`)
            .then(response => response.json())
            .then(data => {
                resultsDiv.innerHTML = "";
                if (data.length === 0) {
                    resultsDiv.innerHTML = "<p>No se encontraron resultados.</p>";
                } else {
                    data.forEach(item => {
                        const resultItem = document.createElement("div");
                        resultItem.classList.add("result-item");
                        resultItem.innerHTML = `
                            <h3>${item.Título}</h3>
                            <p><strong>Autor:</strong> ${item.Autor}</p>
                            <p><strong>Resumen:</strong> ${item.Resumen}</p>
                            <a href="${item.Enlace}" target="_blank">Leer más</a>
                        `;
                        resultsDiv.appendChild(resultItem);
                    });
                }
            });
    }
    
});
*/

document.addEventListener("DOMContentLoaded", () => {
    const categorySelect = document.getElementById("category");
    const tagInput = document.getElementById("tag-input");
    const tagsContainer = document.getElementById("tags-container");
    const platformSelect = document.getElementById("platform"); // Nuevo campo
    const searchButton = document.getElementById("search-button");
    const resultsDiv = document.getElementById("results");

    let tags = []; // Lista de etiquetas seleccionadas

    // Manejar el ingreso de etiquetas
    tagInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && tagInput.value.trim() !== "") {
            e.preventDefault();
            if (tags.length < 10) {
                addTag(tagInput.value.trim());
                tagInput.value = "";
            } else {
                alert("Máximo 10 etiquetas permitidas.");
            }
        }
    });

    function addTag(tag) {
        if (!tags.includes(tag)) {
            tags.push(tag);

            const tagElement = document.createElement("span");
            tagElement.classList.add("tag");
            tagElement.textContent = tag;

            const removeButton = document.createElement("button");
            removeButton.textContent = "×";
            removeButton.classList.add("remove-tag");
            removeButton.addEventListener("click", () => {
                removeTag(tag);
            });

            tagElement.appendChild(removeButton);
            tagsContainer.insertBefore(tagElement, tagInput);
        }
    }

    function removeTag(tag) {
        tags = tags.filter((t) => t !== tag);
        const tagElements = document.querySelectorAll(".tag");
        tagElements.forEach((tagElement) => {
            if (tagElement.textContent.startsWith(tag)) {
                tagsContainer.removeChild(tagElement);
            }
        });
    }

    // Manejar clic en el botón "Buscar"
    searchButton.addEventListener("click", performSearch);

    function performSearch() {
        const category = categorySelect.value;
        const platform = platformSelect.value; // Obtener la plataforma seleccionada

        // Construir la URL con los filtros
        let query = `/api/search?category=${category}&tags=${tags.join(",")}`;
        if (platform) {
            query += `&platform=${platform}`;
        }

        // Realizar la búsqueda en el servidor
        fetch(query)
            .then(response => response.json())
            .then(data => {
                resultsDiv.innerHTML = "";
                if (data.length === 0) {
                    resultsDiv.innerHTML = "<p>No se encontraron resultados.</p>";
                } else {
                    data.forEach(item => {
                        const resultItem = document.createElement("div");
                        resultItem.classList.add("result-item");
                        resultItem.innerHTML = `
                            <h3>${item.Título}</h3>
                            <p><strong>Autor:</strong> ${item.Autor}</p>
                            <p><strong>Resumen:</strong> ${item.Resumen}</p>
                            <p><strong>Plataforma:</strong> ${item.Plataforma}</p>
                            <a href="${item.Enlace}" target="_blank">Leer más</a>
                        `;
                        resultsDiv.appendChild(resultItem);
                    });
                }
            });
    }
});

