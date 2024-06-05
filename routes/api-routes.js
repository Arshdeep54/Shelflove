const router = require("express").Router();

const authRoutes = require("./api/auth-routes");
const userRoutes = require("./api/user-routes");
const adminRoutes = require("./api/admin-routes");
const isLoggedIn = require("../middlewares/isLoggedIn");
const isAdminMiddleware = require("../middlewares/isAdminMiddlware");

router.use("/auth", authRoutes);
router.use("/user", userRoutes);
router.use("/admin",isLoggedIn,isAdminMiddleware, adminRoutes);

module.exports = router;
