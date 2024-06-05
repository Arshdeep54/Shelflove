const router = require("express").Router();

const authRoutes = require("./api/auth-routes");
const userRoutes = require("./api/user-routes");
const adminRoutes = require("./api/admin-routes");

router.use("/auth", authRoutes);
router.use("/user", userRoutes);
router.use("/admin", adminRoutes);

module.exports = router;
