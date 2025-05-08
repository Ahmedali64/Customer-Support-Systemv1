import { user } from "../utils/userHelper.js";

// List all users
export const listUsers = async (req, res) => {
    try {
        const users = await user.findAll();
        res.status(200).json({ success: true, users });
    } catch (err) {
        res.status(500).json({ success: false, message: "Server error", error: err.message });
    }
};
//Get a spacific user
export const getUser = async(req,res) => {
    try{
        const { id }=req.params;
        userData = await user.findById(id);
        return res.status(200).json(userData);
    }catch(err){
        res.status(500).json({ success: false, message: "Server error", error: err.message });
    }
};
// Edit a user
export const editUser = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedData = req.body;
        const updatedUser = await user.update(id, updatedData);
        if (!updatedUser) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        res.status(200).json({ success: true, message: "User updated successfully", updatedUser });
    } catch (err) {
        res.status(500).json({ success: false, message: "Server error", error: err.message });
    }
};
// Delete a user
export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await user.delete(id);
        if (!deleted) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        res.status(200).json({ success: true, message: "User deleted successfully" });
    } catch (err) {
        res.status(500).json({ success: false, message: "Server error", error: err.message });
    }
};

//profile update
export const updateProfile = async(req,res) => {
    try{
        const { id } = req.user; 
        const name = req.body.name ;
        const avatar = req.body.avatar;//we are just saving ava name 
        if (avatar && !avatar.startsWith("/uploads/avatars/")) {
            return res.status(400).json({ message: "No fields to update" });
        };
        const updatedData = {};
        if (name) updatedData.name = name;
        if (avatar) updatedData.avatar = avatar;
        const updatedUser = await user.update(id, updatedData);
        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({ message: "Profile updated successfully", updatedUser });
    }catch(err){
        res.status(500).json({ message: "Server error", error: err.message });
    }
};