const router = require('express').Router();
const philips = require('../../../../index');
const colorConvert = require('../../../../utils/colorConvert');

router.post('/', (req, res) => {
    const { details } = req.body;
    let { state, id } = details;
    let { color } = state;
    philips.setLightState(id, state)
    .then((result) => {
        console.log(result)
        res.sendStatus(200);
    })
    .catch((err) => {
        console.log(err.stack)
        res.send(err.stack);
    })
})

router.patch('/', (req, res) => {
    let { payload } = req.body;
    let { state } = payload;
    let { color } = state;
    payload = {
        ...payload,
        state: {
            ...payload.state,
            xy: colorConvert(color),
        },
    }
    philips.executeInstruction('setstate', payload)
    .then((result) => {
        res.status(200).json(result);
    })
    .catch((err) => {
        console.log(err.stack);
        res.send(err);
    })

})

module.exports = router;