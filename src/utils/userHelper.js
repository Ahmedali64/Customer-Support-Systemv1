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
 
};