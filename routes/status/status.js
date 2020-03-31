const router = require('express').Router();

router.use('/lights/', require('./lights/lights'))

module.exports = router;