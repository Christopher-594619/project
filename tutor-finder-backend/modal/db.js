const mysql2 = require("mysql2");

const dbConfig = {
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || "tutor_finder",
    connectTimeout: 10000,

    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,

    enableKeepAlive: true,
    keepAliveInitialDelay: 0
};

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