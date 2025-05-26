import { user } from "../models/userModel.js";
import { logger }  from "../config/logger.js";
import knexConnection from "../config/knexConnection.js";
//these are for admin only

// List all users
export const listUsers = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query; // Default to page 1 and 10 tickets per page
        const offset = (page - 1) * limit;
        const users = await user.findAll(limit,offset);
        logger.info(`Admin with ID:${adminID} retrieved users data`);
        res.status(200).json({ success: true, users });
    } catch (err) {
        logger.error(`an error occured while retrieving users data admin ID: ${req.session.userId} `);
        res.status(500).json({ success: false, message: "Server error", error: err.message });
    }
};
//Get a spacific user
export const getUser = async(req,res) => {
    try{
        const { id }=req.params;
        const adminID = req.session.userId;
        if(!id){
            logger.warn(`Admin with ID:${adminID} Did not provide a User ID`);
            res.status(404).json({message:"No user ID procided"});
        }

        const userData = await user.findById(id);
        console.log(userData)
        logger.info(`Admin with ID:${adminID} retrieved user data with ID: ${id}`);
        return res.status(200).json({message:"Success",userData});
    }catch(err){
        logger.error(`an error occured while retrieving user data admin ID: ${req.session.userId} `);
        res.status(500).json({ success: false, message: "Server error", error: err.message });
    }
};
// Edit user role
export const editUserRole = async (req, res) => {
    try {
        const { id } = req.params;//user id 
        const changed_by = req.session.userId;//admin id
        const { oldRole:oldR , newRole:newR } = req.body;// old role new role 
        //so i found a problem where u can update a thing with the same thing i mean
        //if lets say there is an agent and i updated him to agent it will save in the database 
        //i do not wanna allow that 
        const {role:currentUserRole} = await knexConnection("users").select("role").first();
        if(currentUserRole === newR){
            logger.warn(`Admin with ID:${changed_by} is Replacing Current Role with similar Role`);
            return res.status(400).json({message:"You can not Replace Role with same Role!"});
        }
        const updatedUser = await user.updateUserRole(id,oldR,newR,changed_by);
        if (!updatedUser) {
            logger.error(`NO user Found. updateing the user Role By admin ID:${id}`);
            return res.status(404).json({ success: false, message: "User not found" });
        }
        logger.info(`Admin ID:${changed_by} has updated user ID:${updatedUser.id} Role Successfully from ${oldR} to ${newR}`);
        res.status(200).json({ success: true, message: "User updated successfully", updatedUser });
    } catch (err) {
        logger.error(`error while updating the user Role By admin ID:${req.session.userId}`);
        res.status(500).json({ success: false, message: "Server error", error: err.message });
    }
};
// Delete a user
export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const adminID = req.session.userId;
        const deleted = await user.delete(id);
        if (!deleted) {
            logger.error(`NO user Found. Deleting user By admin ID:${adminID}`);
            return res.status(404).json({ success: false, message: "User not found" });
        }
        logger.info(`user deleted successfully By admin ID:${adminID}`);
        res.status(200).json({ success: true, message: "User deleted successfully" });
    } catch (err) {
        logger.error(`an error ocurred while deleting user By admin ID:${adminID}`);
        res.status(500).json({ success: false, message: "Server error", error: err.message });
    }
};
//profile update as a user 
export const updateProfile = async(req,res) => {
    try{
        const { id:userID, role:userRole } = req.user; 
        const name = req.body.name ;// new name 
        //we attached this in the processAvatar middleware
        const avatar = req.body.avatar;//we are just saving ava name in the Data base 
        if (avatar && !avatar.startsWith("/uploads/avatars/")) {
            return res.status(400).json({ message: "No fields to update" });
        };
        const updatedData = {};
        if (name) updatedData.name = name;
        if (avatar) updatedData.avatar = avatar;
        //for now we are just updating name and avatar later we can add more stuff 
        const updatedUser = await user.updateNameAvatar(userID, updatedData);//name and ava only 
        if (!updatedUser) {
            logger.error(`User data didn't get updated`)
            return res.status(404).json({ message: "User not found" });
        }
        logger.info(`User Data has been updated successfully userID: ${userID}`)
        res.status(200).json({ message: "Profile updated successfully", updatedUser });
    }catch(err){
        logger.error(`an error ocurred while updating user Data(name / ava)`)
        res.status(500).json({ message: "Server error", error: err.message });
    }
};