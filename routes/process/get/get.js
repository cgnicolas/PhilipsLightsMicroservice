const router = require('express').Router();

router.use('/lights', require('./lights/lights'))
router.use('/rooms', require('./rooms/rooms'));

module.exports = router;