/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
    await knex.schema.createTable("ticket_history" , (table)=>{
        table.uuid("id").primary();
        table.uuid("changed_by").references("id").inTable("users").onDelete("SET NULL");//set null 
        table.uuid("ticket_id").references("id").inTable("tickets").onDelete("CASCADE");
        table.string("status").notNullable(); 
        table.timestamps(true,true);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
    await knex.schema.dropTable('ticket_history');
} 
