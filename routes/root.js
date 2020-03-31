const router = require('express').Router();

router.use('/process', require('./process/process'));
router.use('/register', require('./register/register'));
router.use('/status', require('./status/status'));

module.exports = router;