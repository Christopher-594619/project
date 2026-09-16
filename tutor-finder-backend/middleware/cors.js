const corsOptions = {
    origin: [
        "http://localhost:3000",
        "http://localhost:5173",
        "https://heritage-privatize-pesky.ngrok-free.dev"
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
};

module.exports = { corsOptions };