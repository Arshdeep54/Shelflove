const router = require("express").Router();
//api requires can also be done separately
const apiRoutes=require('./api-routes')
const renderRoutes=require('./render-routes')


router.use("/api", apiRoutes);
router.use("/",renderRoutes)


module.exports = router;
