// Simple role guard; expects req.user.role to exist
export const roleGuard = (...allowedRoles) => {
  return (req, res, next) => {
    if (!allowedRoles || allowedRoles.length === 0) return next();
    const role = req.user?.role;
    if (!role || !allowedRoles.includes(role)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to perform this action'
      });
    }
    return next();
  };
};




