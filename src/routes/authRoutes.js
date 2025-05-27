import express from 'express';
import { login, register , logout ,refreshToken} from "../controllers/authController.js";
import { registerValidation,loginValidation } from '../utils/userValidation.js';
import { validate } from "../middlewares/validationMiddleware.js"
import { user }from "../models/userModel.js";
import passport from "passport";
const router = express.Router();

router.post('/register',validate(registerValidation),register);
router.post('/login',validate(loginValidation),login);
router.post('/refresh', refreshToken);
router.delete('/logout',logout);

//Route for Google Login
//this route is the route that user will make a req to login with google 
//passpor will redirect user to the authserver 
router.get('/google',passport.authenticate('google', { scope: ['profile', 'email'] }));

//this one will rececve the callback from the auth server with the user profile 
router.get("/google/callback",
    passport.authenticate("google", { failureRedirect: "/login" }),
    async (req, res) => {
        const User = req.user; // User profile from Google
        const existingUser = await user.findByEmail(User.emails[0].value);
        if (!existingUser) {
            await user.createUser({
                name: User.displayName,
                email: User.emails[0].value,
                role: "customer", // Or any default role
            });
        }
        res.status(200).json({ message: "Login successful", User });
    }
);

export default router;