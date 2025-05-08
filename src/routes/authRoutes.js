import express from 'express';
import { login, register , logout ,refreshToken} from "../Controllers/AuthControllers.js";
import { registerValidation,loginValidation } from '../utils/userValidation.js';
import validate from "../middlewares/validationMiddleware.js"
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
        const user = req.user; // User profile from Google
        const existingUser = await User.findByEmail(user.emails[0].value);
        if (!existingUser) {
            await User.createUser({
                name: user.displayName,
                email: user.emails[0].value,
                role: "customer", // Or any default role
            });
        }
        res.status(200).json({ message: "Login successful", user });
    }
);

export default router;