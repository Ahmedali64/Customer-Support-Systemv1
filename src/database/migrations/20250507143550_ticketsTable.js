/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {

    await knex.schema.createTable("tickets" , (table)=>{
       table.uuid("id").primary();
       table.uuid("customer_id").references("id").inTable("users").onDelete("CASCADE");
       table.uuid("agent_id").references("id").inTable("users").onDelete("SET NULL");
       table.string("subject").notNullable();
       table.text("description").notNullable();
       table.enum("status", ["open", "in_progress", "resolved","escalated"]).defaultTo("open");
       table.timestamps(true, true);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
    await knex.schema.dropTable("tickets");
};
