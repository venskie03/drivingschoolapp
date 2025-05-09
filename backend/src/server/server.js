require('dotenv').config();
const { Client } = require('pg');

const connection = new Client({
    host: 'localhost',
    port: 5432,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

connection.connect()
  .then(() => console.log("DATABASE CONNECTED"))
  .catch(err => console.error("Connection error", err.stack));


module.exports = connection;