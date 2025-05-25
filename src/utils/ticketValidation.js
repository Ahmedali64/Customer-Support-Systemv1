import Joi from "joi";

export const ticketCreationValidation = Joi.object({
    subject: Joi.string().min(3).max(100).required(),
    description: Joi.string().min(10).required(),
});