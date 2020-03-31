const router = require('express').Router();
const philips = require('../../../index');

router.get('/', (req, res) => {
    philips.getLights()
    .then((result) => {
        res.json(result);
    })
    .catch((err) => {
        res.send(err);
    })
})

module.exports = router;