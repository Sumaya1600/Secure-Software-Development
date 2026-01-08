// backend/middleware/rbac.js
module.exports = function allowRoles(...rolesAllowed) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: "Not authenticated" });

    if (!rolesAllowed.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden: insufficient role" });
    }

    next();
  };
};
