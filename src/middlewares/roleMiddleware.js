export const authorizedRoles = (...allowedRoles)=>{
    return (req, res, next) => {
        try {
          const role = req.user?.role || req.session?.role;
          // Ensure the user is authenticated and has a role
           if (!role) {
            return res.status(401).json({ message: "Unauthorized: No role found" });
          }
    
          // Check if the user's role is in the allowed roles
          if (!allowedRoles.includes(role)) {
            return res.status(403).json({ 
              message: `Forbidden: ${role} cannot access this resource` 
            });
          }
    
          // User is authorized
          next();
        } catch (err) {
          console.error("Error in RBAC middleware:", err);
          return res.status(500).json({ message: "Internal server error" });
        }
      };
};