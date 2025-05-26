/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
    await knex.schema.createTable("user_history" , (table)=>{
        table.uuid("id").primary();
        table.uuid("changed_by").references("id").inTable("users").onDelete("SET NULL");//set null 
        //when admin del user from main user data base it will remove all changed Data 
        table.uuid("user_id").references("id").inTable("users").onDelete("CASCADE");
        //tbh i have no idea of what an admin can update so lets just say for now that admin can change 
        //user role
        table.string("old_role");
        table.string("new_role");
        table.timestamps(true,true);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
    await knex.schema.dropTable('user_history');
} 
