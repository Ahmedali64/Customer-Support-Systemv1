export const authorizedRoles = (...allowedRoles)=>{
    return (req, res, next) => {
        try {
          // Ensure the user is authenticated and has a role
          if (!req.user || !req.user.role) {
            return res.status(401).json({ message: "Unauthorized: No role found" });
          }
    
          // Check if the user's role is in the allowed roles
          if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ message: "Forbidden: You do not have access to this resource" });
          }
    
          // User is authorized
          next();
        } catch (err) {
          console.error("Error in RBAC middleware:", err);
          return res.status(500).json({ message: "Internal server error" });
        }
      };
};