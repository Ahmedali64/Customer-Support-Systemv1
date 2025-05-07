export const validate = (schema) => (req, res, next) => {
    // Validate the request body against the provided schema
   const { error, value } = schema.validate(req.body ,{ abortEarly: false, stripUnknown: true });
    if (error) {
        return res.status(400).json({
            success: false,
            message: "Validation failed",
            details: error.details.map((err) => err.message),
        });
    }  
    // If validation is successful, assign the sanitized value back to req.body
    //we do this caise we want to remove the unwanted fields from the request body
    //we did that through the stripUnknown option in the schema.validate method
    //this will remove the unwanted fields from the request body and assign the sanitized value back to req.body
    req.body = value; // Assign sanitized data back to req.body
    next();

}