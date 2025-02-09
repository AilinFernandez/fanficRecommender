/*
require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const OpenAI = require("openai");
const cors = require("cors");

const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");


const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.static("public"));

// Diccionario para almacenar la memoria de cada usuario (se borra cuando se reinicia el servidor)
let historialUsuarios = {};

io.on("connection", (socket) => {
    console.log(`Usuario conectado: ${socket.id}`);

    // Crear historial vacío si el usuario es nuevo
    if (!historialUsuarios[socket.id]) {
        historialUsuarios[socket.id] = [];
    }

    socket.on("mensaje", async (msg) => {
        console.log(`Pregunta de ${socket.id}:`, msg);

        // Agregar la pregunta del usuario al historial
        historialUsuarios[socket.id].push({ role: "user", content: msg });

        try {
            // Enviar el historial al modelo (limitado a los últimos 5 mensajes para no gastar demasiados tokens)
            const respuesta = await openai.chat.completions.create({
                model: "gpt-4o",
                messages: [
                    { role: "system", content: `Eres Meli , una IA especializada en recomendar fanfics, libros e historias. Tu objetivo es ayudar a los usuarios a encontrar la historia perfecta para ellos, basándote en sus gustos, preferencias y estados de ánimo. Además, puedes responder preguntas sobre la trama, personajes y desarrollo de las historias disponibles en tu base de datos.

                            📌 Funcionalidades principales:
                            🔎Recomendaciones personalizadas

                            Sugiere fanfics, libros o historias basadas en géneros, etiquetas, tropos o preferencias del usuario.
                            Puede recomendar historias similares a otras que el usuario ya haya disfrutado.
                            Justifica cada recomendación con detalles atractivos sobre la historia.
                            📂 Búsqueda avanzada

                            Permite buscar por filtros como género, fandom, ship, clasificación, longitud, autor, tropos, etc.
                            Opción de encontrar historias con criterios específicos (Ejemplo: "Quiero un slow burn con final feliz").
                            📖 Consultas sobre historias

                            Responde preguntas sobre la trama, personajes y desarrollo de cualquier historia en su base de datos.
                            Puede resumir sin spoilers o con spoilers si el usuario lo solicita.
                            Explique giros argumentales o detalles específicos bajo petición.
                            🗣️ Interacción envolvente

                            Meli habla de los fanfics, libros e historias con entusiasmo.
                            Se adapta al tono del usuario (puede ser más formal o más fangirl/fanboy según el contexto).
                            Puede sugerir historias según el estado de ánimo del usuario.
                            💡 Formato de respuestas

                            Respuestas claras y atractivas.
                            Uso de emojis y negritas para resaltar información.
                            Explicaciones concisas pero convincentes.
                            Siempre muestra los enlaces completos para que los usuarios puedan hacer clic en ellos sin problemas. Ejemplo:
                            Enlace: **El rey dorado** → https://archiveofourown.org/works/44979484

                            📌 Manejo de errores:
                            Si no encuentra una columna esperada en el archivo de datos, buscará automáticamente en otras columnas relevantes sin mostrar mensajes técnicos.
                            Si no hay resultados directos, dirá algo más natural como: "No encontré resultados directos, pero puedo revisar con otro criterio o sugerirte algo similar. ¿Quieres que lo intente?". Recuerdas el contexto de la conversación dentro de esta sesión.`
                    },
                    ...historialUsuarios[socket.id].slice(-5) // Solo envía los últimos 5 mensajes
                ],
            });

            const respuestaMeli = respuesta.choices[0].message.content;
            
            // Agregar la respuesta de Meli al historial
            historialUsuarios[socket.id].push({ role: "assistant", content: respuestaMeli });

            // Enviar la respuesta al usuario
            socket.emit("respuesta", respuestaMeli);
        } catch (error) {
            console.error("Error con OpenAI:", error);
            socket.emit("respuesta", "Lo siento, hubo un error al procesar tu pregunta.");
        }
    });

    socket.on("disconnect", () => {
        console.log(`Usuario desconectado: ${socket.id}`);
        delete historialUsuarios[socket.id]; // Borra la memoria de este usuario cuando se desconecta
    });
});

server.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
*/

/*
require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const OpenAI = require("openai");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const Papa = require("papaparse"); // ✅ Librería más rápida que csv-parser
const { web } = require("web"); // ✅ Integración de búsqueda en la web

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.static("public"));

// 📌 **Cargar datos desde el CSV en memoria (Método rápido)**
let fanficsDB = [];

const loadCSV = () => {
    const csvFilePath = path.join(__dirname, "./data/ao3_fanficsPrueba.csv");

    try {
        const csvData = fs.readFileSync(csvFilePath, "utf8"); // ✅ Leer archivo completo en memoria
        fanficsDB = Papa.parse(csvData, {
            header: true, // ✅ Mantiene los nombres de columna
            skipEmptyLines: true // ✅ Omite líneas vacías
        }).data;
        console.log(`📚 ${fanficsDB.length} fanfics cargados correctamente.`);
    } catch (error) {
        console.error("❌ Error al cargar el archivo CSV:", error);
    }
};

// 📌 **Cargar CSV al iniciar el servidor**
loadCSV();

// 📌 **Diccionario para almacenar la memoria de cada usuario**
let historialUsuarios = {};

// 📌 **Manejo de conexiones de Socket.io**
io.on("connection", (socket) => {
    console.log(`👤 Usuario conectado: ${socket.id}`);

    if (!historialUsuarios[socket.id]) {
        historialUsuarios[socket.id] = [];
    }

    socket.on("mensaje", async (msg) => {
        console.log(`📩 Pregunta de ${socket.id}:`, msg);
        historialUsuarios[socket.id].push({ role: "user", content: msg });

        try {
            // 📌 **Convertir toda la base de datos en un solo texto para que GPT analice con contexto**
            const fanficsTexto = fanficsDB.slice(0, 200).map(fanfic => // ✅ Tomamos solo los primeros 200 para evitar sobrecarga
                `📖 **Título:** ${fanfic.Título}
                ✍️ **Autor:** ${fanfic.Autor}
                🏷️ **Etiquetas:** ${fanfic.Etiquetas}
                📜 **Resumen:** ${fanfic.Resumen}
                🔗 **Enlace:** ${fanfic.Enlace}`
            ).join("\n\n");

            // 📌 **Consultar OpenAI con la base de datos completa**
            const respuesta = await openai.chat.completions.create({
                model: "gpt-4o",
                messages: [
                    { role: "system", content: `Eres Meli, una IA recomendadora de fanfics y libros. 
                    Debes encontrar recomendaciones dentro de la base de datos de fanfics antes de generar una respuesta propia. 
                    
                    📌 **Reglas:**
                    - Usa contexto, no busques solo coincidencias exactas.
                    - Si encuentras fanfics relevantes, preséntalos primero.
                    - No inventes fanfics que no existen.
                    - No des enlaces si no están en la base de datos.
                    - Si no encuentras una respuesta relevante, entonces puedes generar una respuesta propia, es decir, buscar en la web.
                    -Tu objetivo es ayudar a los usuarios a encontrar la historia perfecta para ellos, basándote en sus gustos, preferencias y estados de ánimo. Además, puedes responder preguntas sobre la trama, personajes y desarrollo de las historias disponibles en tu base de datos.
                    

                    📌 **Base de datos de fanfics:**
                    ${fanficsTexto}` 
                    },
                    ...historialUsuarios[socket.id].slice(-5), // ✅ Solo los últimos 5 mensajes del usuario
                    { role: "user", content: msg }
                ],
            });

            let respuestaMeli = respuesta.choices[0].message.content;

            historialUsuarios[socket.id].push({ role: "assistant", content: respuestaMeli });
            socket.emit("respuesta", respuestaMeli);

        } catch (error) {
            console.error("❌ Error con OpenAI:", error);
            socket.emit("respuesta", "Lo siento, hubo un error al procesar tu pregunta.");
        }
    });

    socket.on("disconnect", () => {
        console.log(`🔌 Usuario desconectado: ${socket.id}`);
        delete historialUsuarios[socket.id];
    });
});

// 📌 **Iniciar servidor en el puerto especificado**
server.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});

// 📌 **Ruta para volver a cargar la base de datos sin reiniciar el servidor**
app.get("/reload-db", (req, res) => {
    loadCSV();
    res.json({ message: "📚 Base de datos recargada exitosamente." });
});

// 📌 **Rutas para manejar las búsquedas**
app.get("/api/search", (req, res) => {
    const { category, tags, platform } = req.query;
    const tagList = tags ? tags.split(",") : [];

    const results = fanficsDB.filter((fanfic) => {
        const matchesCategory = !category || fanfic.Categoría === category;
        const matchesTags = tagList.length === 0 || tagList.every(tag => fanfic.Etiquetas.includes(tag));
        const matchesPlatform = !platform || fanfic.Plataforma === platform;
        return matchesCategory && matchesTags && matchesPlatform;
    });

    res.json(results);
});
*/


require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const OpenAI = require("openai");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const Papa = require("papaparse");
const { web } = require("web"); // Integración con el buscador web

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.static("public"));

// 📌 **Cargar datos desde el CSV en memoria (Método rápido)**
let fanficsDB = [];

const loadCSV = () => {
    const csvFilePath = path.join(__dirname, "./data/ao3_fanficsPrueba.csv");

    try {
        const csvData = fs.readFileSync(csvFilePath, "utf8");
        fanficsDB = Papa.parse(csvData, {
            header: true,
            skipEmptyLines: true
        }).data;
        console.log(`📚 ${fanficsDB.length} fanfics cargados correctamente.`);
    } catch (error) {
        console.error("❌ Error al cargar el archivo CSV:", error);
    }
};

// 📌 **Cargar CSV al iniciar el servidor**
loadCSV();

// 📌 **Diccionario para almacenar la memoria de cada usuario**
let historialUsuarios = {};

// 📌 **Manejo de conexiones de Socket.io**
io.on("connection", (socket) => {
    console.log(`👤 Usuario conectado: ${socket.id}`);

    if (!historialUsuarios[socket.id]) {
        historialUsuarios[socket.id] = [];
    }

    socket.on("mensaje", async (msg) => {
        console.log(`📩 Pregunta de ${socket.id}:`, msg);
        historialUsuarios[socket.id].push({ role: "user", content: msg });

        try {
            // 📌 **Convertir la base de datos en texto para GPT**
            const fanficsTexto = fanficsDB.slice(0, 200).map(fanfic => 
                `📖 **Título:** ${fanfic.Título}
                ✍️ **Autor:** ${fanfic.Autor}
                🏷️ **Etiquetas:** ${fanfic.Etiquetas}
                📜 **Resumen:** ${fanfic.Resumen}
                🔗 **Enlace:** ${fanfic.Enlace}`
            ).join("\n\n");

            // 📌 **Consultar OpenAI con la base de datos**
            const respuesta = await openai.chat.completions.create({
                model: "gpt-4o",
                messages: [
                    { role: "system", content: `Eres Meli, una IA recomendadora de fanfics y libros.
                    - Primero, busca en la base de datos antes de recomendar algo.
                    - Usa contexto, no solo coincidencias exactas.
                    - Si no encuentras una respuesta en la base de datos, busca automáticamente en la web.

                    📌 **Base de datos de fanfics:**
                    ${fanficsTexto}` 
                    },
                    ...historialUsuarios[socket.id].slice(-5),
                    { role: "user", content: msg }
                ],
            });

            let respuestaMeli = respuesta.choices[0].message.content;

            // 📌 **Si no hay resultados en la base de datos, buscar en la web AUTOMÁTICAMENTE**
            if (respuestaMeli.includes("No encontré resultados")) {
                console.log("🔍 No encontré en la base de datos, buscando en la web...");
                const webResults = await buscarEnWeb(msg);
                
                if (webResults.length > 0) {
                    let resultadosEstructurados = "🔎 **Aquí tienes algunas opciones de la web:**\n\n";
                    
                    webResults.forEach((result, index) => {
                        resultadosEstructurados += `📖 **${result.title}**\n📜 ${result.description}\n🔗 [Leer aquí](${result.url})\n\n`;
                    });

                    respuestaMeli = resultadosEstructurados;
                } else {
                    respuestaMeli = "😢 No encontré fanfics en la base de datos ni en la web. Prueba con otro término.";
                }
            }

            historialUsuarios[socket.id].push({ role: "assistant", content: respuestaMeli });
            socket.emit("respuesta", respuestaMeli);

        } catch (error) {
            console.error("❌ Error con OpenAI:", error);
            socket.emit("respuesta", "Lo siento, hubo un error al procesar tu pregunta.");
        }
    });

    socket.on("disconnect", () => {
        console.log(`🔌 Usuario desconectado: ${socket.id}`);
        delete historialUsuarios[socket.id];
    });
});

// 📌 **Función para buscar fanfics en la web**
async function buscarEnWeb(consulta) {
    try {
        console.log(`🌍 Buscando en la web: ${consulta}`);
        const searchResults = await web.search(`site:archiveofourown.org OR site:fanfiction.net OR site:wattpad.com ${consulta} fanfic`);
        
        return searchResults.slice(0, 5).map((result) => ({
            title: result.title,
            url: result.url,
            description: result.description
        }));
    } catch (error) {
        console.error("❌ Error en la búsqueda web:", error);
        return [];
    }
}

// 📌 **Iniciar servidor en el puerto especificado**
server.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});

// 📌 **Ruta para volver a cargar la base de datos sin reiniciar el servidor**
app.get("/reload-db", (req, res) => {
    loadCSV();
    res.json({ message: "📚 Base de datos recargada exitosamente." });
});

// 📌 **Rutas para manejar las búsquedas**
app.get("/api/search", (req, res) => {
    const { category, tags, platform } = req.query;
    const tagList = tags ? tags.split(",") : [];

    const results = fanficsDB.filter((fanfic) => {
        const matchesCategory = !category || fanfic.Categoría === category;
        const matchesTags = tagList.length === 0 || tagList.every(tag => fanfic.Etiquetas.includes(tag));
        const matchesPlatform = !platform || fanfic.Plataforma === platform;
        return matchesCategory && matchesTags && matchesPlatform;
    });

    res.json(results);
});



