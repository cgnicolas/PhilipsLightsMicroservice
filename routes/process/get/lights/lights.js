const router = require('express').Router();
const philips = require('../../../../index');

router.get('/', (req, res) => {
    philips.getLights()
    .then((lights) => {
        res.status(200).json(lights);
    })
    .catch((err) => {
        console.log(err);
        res.send(err.stack);
    })
})

module.exports = router;