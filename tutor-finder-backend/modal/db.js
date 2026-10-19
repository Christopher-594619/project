const mysql2 = require("mysql2");

const dbConfig = {
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD ?? "",
    database: process.env.DB_NAME || "tutor_finder",
    connectTimeout: 10000,

    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,

    enableKeepAlive: true,
    keepAliveInitialDelay: 0
};

// Online MySQL hosts (e.g. Aiven) require an encrypted connection.
// Off unless DB_SSL=true, so the local XAMPP setup is unchanged.
// DB_CA_CERT may hold the provider's CA certificate (newlines as \n) to
// verify the server; without it the connection is encrypted but unverified.
if (process.env.DB_SSL === "true") {
    dbConfig.ssl = process.env.DB_CA_CERT
        ? { ca: process.env.DB_CA_CERT.replace(/\\n/g, "\n"), rejectUnauthorized: true }
        : { rejectUnauthorized: false };
}

const db = mysql2.createPool({
    ...dbConfig
});

console.log("Connecting to MySQL:");
console.log(`Host: ${dbConfig.host}`);
console.log(`Port: ${dbConfig.port}`);
console.log(`Database: ${dbConfig.database}`);

// Test the connection
db.getConnection((err, connection) => {
    if (err) {
        console.error("There was an error connecting to the database:");
        console.error({
            code: err.code,
            errno: err.errno,
            syscall: err.syscall
        });
        return;
    }

    console.log(" Database connected.");

    // Return the connection to the pool
    connection.release();
});

module.exports = { db };
