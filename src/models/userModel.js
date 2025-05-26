import knexConnection from "../config/knexConnection.js";
import {v4 as uuidv4} from "uuid";
import { upload } from "../middlewares/uploadMiddleware.js";

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
    return await knexConnection('users').where({ email })
    .first();
  },
  async findById(userID) {
    return await knexConnection('users').where({ id:userID })
    .select("id", "name", "email", "role", "created_at")
    .first();
  },    
  async findAll(limit, offset) {
    return await knexConnection("users")
        .select("id", "name", "email", "role", "created_at")
        .limit(limit)
        .offset(offset);
  },
  async updateUserRole(id, oldR , newR , changedBy) {
    try{
      //update Role
      //note we can not chain First with Update 
      //and update Return [1] not Data 
      await knexConnection("users").where({id}).update({role:newR})
     
      //i sould add new user changes to user log and return new data 
      await knexConnection("user_history").insert({
        id:uuidv4(),
        changed_by:changedBy,
        user_id:id,
        old_role:oldR,
        new_role:newR,
      });

      return await knexConnection("users").select("id","name","email","role").first();

    }catch(err){
      console.log("error while updating the userData", err.message);
      throw err;
    }
  },
  async delete(id) {
      const deletedRows = await knexConnection("users").where({ id }).del();
      return deletedRows > 0;
  },
  async updateNameAvatar(userID,newData){
    const {name:newName,avatar:newAva} = newData;
    await knexConnection('users').where({id:userID}).update({name:newName, avatar:newAva});
    return await knexConnection('users').where({id:userID}).select("name" , "avatar").first();
  },
 
};