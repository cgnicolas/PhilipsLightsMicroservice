const router = require('express').Router();
const philips = require('../../../../index');
router.patch('/', (req, res) => {
    let { payload } = req.body;
    const { state } = payload;
    const { bri } = state;
    payload = {
        ...req.body.payload,
        state: {
            ...state,
            bri
        }
    }

    philips.setLightState(payload.id, payload.state)
    .then((result) => {
        res.status(200).send(result);
    })
    .catch((err) => {
        res.status(400).send(err.stack);
    })
    
})

function map(num, in_min, in_max, out_min, out_max) {
    return (num - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}

module.exports = router;