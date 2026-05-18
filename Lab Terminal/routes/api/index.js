const express = require('express');
const router  = express.Router();

// Mount sub-routers under /api/v1
router.use('/auth',     require('./auth'));
router.use('/products', require('./products'));
router.use('/orders',   require('./orders'));
router.use('/user',     require('./user'));

module.exports = router;
