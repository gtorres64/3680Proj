const mysql = require('mysql2');
require('dotenv').config()

const pool = mysql.createPool({
    host: process.env.SQL_HOST,
    user: process.env.SQL_USER,
    password: process.env.SQL_PASS,
    database: process.env.SQL_DB
}).promise()

async function getUsers() {
    const [rows] = await pool.query("SELECT * FROM users");
    return rows;
}

async function insertUser(username, password, email, firstName, lastName, uId) {
    const [rows] = await pool.query(`
    INSERT INTO users (
    username, 
    password, 
    email, 
    firstName, 
    lastName,
    uId) 
    VALUES (?, ?, ?, ?, ?, ?)`,
    [username, password, email, firstName, lastName, uId]);
    return rows.insertId;
}

async function findUserByEmail(email) {
    const [rows] = await pool.query(`
    SELECT * FROM users WHERE email = ?`,
    [email]);
    return rows[0];
}

async function findUserById(userID) {
    const [rows] = await pool.query(`
    SELECT * FROM users WHERE userID = ?`,
    [userID]);
    return rows[0];
}

/*
(async () => {
    try {
        const dbUsers = await getUsers();
        console.log(dbUsers);
    } catch (error) {
        console.error("ERROR GETTING USERS", error);
    }
})();
*/


module.exports = {
    pool,
    insertUser,
    findUserByEmail,
    findUserById
};