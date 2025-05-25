// Update with your config settings.

/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
import { config } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
// Resolve the path to the .env file
// Get the directory name of the current module
const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Load the .env file to the directory
config({ path: path.resolve(__dirname, '../../.env') }); // Adjust the path as neede;
export default {

  development: {
    client: 'mysql2',
    connection: {
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    },
    migrations: {
      directory: '../database/migrations',
      extension: 'js'
    },
    seeds: {
      directory: '../database/seeds',
      extension: 'js'
    },
    pool: {
      min: 2,
      max: 10
    }
  },

  staging: {
    client: 'postgresql',
    connection: {
      database: 'my_db',
      user:     'username',
      password: 'password'
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  },

  production: {
    client: 'postgresql',
    connection: {
      database: 'my_db',
      user:     'username',
      password: 'password'
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  }

};
