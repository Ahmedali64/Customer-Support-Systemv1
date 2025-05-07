/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
    await knex.schema.createTable("users" , (table)=>{
      table.uuid("id").primary(); // UUID column without default
      table.string("name").notNullable();
      table.string("email").unique().notNullable();
      table.string("password").notNullable();
      table.enu("role" ,['customer', 'agent', 'admin']).defaultTo("customer");
      table.timestamps(true, true);
    });
  
  };

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
    await knex.schema.dropTable("users");
};