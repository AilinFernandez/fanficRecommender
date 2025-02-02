require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const OpenAI = require("openai");
const cors = require("cors");

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
                model: "gpt-4o-mini",
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
