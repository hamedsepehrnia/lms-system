/**
 * بررسی نقش کاربر برای دسترسی به routes
 */
export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'لطفاً ابتدا وارد حساب کاربری خود شوید'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'شما دسترسی لازم برای این عملیات را ندارید'
      });
    }

    next();
  };
};

