const router = require('express').Router();
const philips = require('../../../../index');

router.get('/', (req, res) => {
    philips.getLights()
    .then((lights) => {
        let response = [];
        lights.forEach((light) => {
            response.push(light._data);
        })
        res.status(200).json(response);
    })
    .catch((err) => {
        console.log(err);
        res.send(err.stack);
    })
})

module.exports = router;