module.exports = function roleMiddleware(...allowed) {
  return (req, res, next) => {
    const role = req.user?.role;
    if (!role || (allowed.length && !allowed.includes(role))) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }
    next();
  };
};
