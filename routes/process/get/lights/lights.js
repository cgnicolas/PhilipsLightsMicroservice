const router = require('express').Router();
const philips = require('../../../../index');

router.get('/', (req, res) => {
    res.status(200).json(philips._getLocalLights())
})

module.exports = router;