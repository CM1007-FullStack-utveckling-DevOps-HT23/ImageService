module.exports.dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
};

/*
module.exports.dbConfig = {
    host: 'localhost',
    user: 'root',
    password: 'sql-my-beloved',
    database: 'patientdb',
    port: '3307'
};

 */