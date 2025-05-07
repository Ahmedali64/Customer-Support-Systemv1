import mysql from 'mysql2/promise';
import 'dotenv/config'; 


//first we make a connection
async function createDatabase() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  });
//data base name from dotenv
const databaseName = process.env.DB_NAME;

//making the data base if it doesn't exist
  try {
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${databaseName}\``);
    console.log(`Database "${databaseName}" is ready!`);
  } catch (error) {
    console.error('Error creating database:', error.message);
  } finally {
    await connection.end();
  }
}

createDatabase();
