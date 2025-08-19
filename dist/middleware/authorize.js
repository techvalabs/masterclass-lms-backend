export const authorize = (allowedRoles) => {
    return (req, res, next) => {
        const userRole = req.userRole;
        if (!userRole) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. No role found.'
            });
        }
        if (!allowedRoles.includes(userRole)) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Insufficient permissions.'
            });
        }
        next();
    };
};
export default authorize;
//# sourceMappingURL=authorize.js.map