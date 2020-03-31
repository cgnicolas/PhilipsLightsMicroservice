const router = require('express').Router();

router.use('/set', require('./set/set'));
router.use('/get', require('./get/get'));
router.use('/power', require('./power/power'))
module.exports = router;