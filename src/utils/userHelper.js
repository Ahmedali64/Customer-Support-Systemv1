import knexConnection from "../config/knexConnection.js";

export const user = {
  async create(userData) {
    try {
      await knexConnection('users').insert(userData);
      return await knexConnection('users')
        .where({ id: userData.id })
        .select("id", "name", "email", "role")
        .first();
    } catch (err) {
      throw err; // Let controller handle
    }
  },
  async findByEmail(email) {
    return await knexConnection('users').where({ email }).first();
  },
  async findById(id) {
    return await knexConnection('users').where({ id }).first();
  },    
  async findAll(limit = 20, offset = 0) {
    return await knexConnection("users")
        .select("id", "name", "email", "role", "created_at")
        .limit(limit)
        .offset(offset);
  },
  async update(id, updatedData) {
    try{
      const [updatedUser] = await knexConnection("users")
          .where({ id })
          .update(updatedData, ["id", "name", "email", "role","avatar", "updated_at"]);
      return updatedUser;
    }catch(err){
      console.log("error while updating the userData", err.message);
      throw err;
    }
  },
  async delete(id) {
      const deletedRows = await knexConnection("users").where({ id }).del();
      return deletedRows > 0;
  },
 
};