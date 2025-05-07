import knex from "knex";
import knexfile from "./knexfile.js";

const knexConnection = knex(knexfile.development);
knexConnection.raw('SELECT 1')
.then(() => {
    console.log('Knex Connected!');
}).catch((err) => {
    console.error('Error connecting to the database:', err);
});

export default knexConnection;


