const router = require('express').Router();

router.use('/color', require('./color/color'))
router.use('/effect', require('./effect/effect'))
router.use('/brightness', require('./brightness/brightness'))

module.exports = router;