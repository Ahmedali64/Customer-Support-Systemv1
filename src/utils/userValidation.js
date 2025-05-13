import Joi from "joi";
//register validation
export const registerValidation = Joi.object({
    name: Joi.string()
    .min(3)
    .max(30)
    .pattern(/^[a-zA-Z\s-]+$/)
    .trim()
    .required()
    .messages({"string.pattern.base": "Name can only contain letters, spaces, and hyphens."}),
    email : Joi.string()
    .email()
    .trim()
    .required(),
    password:Joi.string()
    .min(8)
    .trim()
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/).required()
    .messages({
      "string.pattern.base":
        "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&).",
    }),
    passwordConfirm: Joi.string()
    .valid(Joi.ref('password')).trim().required().messages({
        "any.only": "Password and confirm password do not match",
    }),
    role: Joi.string()
    .valid('customer', 'agent', 'admin')
    .lowercase()
    .default('customer')
    .trim()
    .required(),
});
//login validation
export const loginValidation = Joi.object( { 
    email: Joi.string().email().trim().required(),
    password: Joi.string().min(8).trim().required(),
});
//profile update validation 
export const profileUpdateValidation = Joi.object({
    name: Joi.string().min(3).max(30).pattern(/^[a-zA-Z\s-]+$/).trim().optional(),
    avatar: Joi.string().uri().optional(),
    //.uri(): Validates that the string is a properly formatted URL
});