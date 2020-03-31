const router = require('express').Router();
const philips = require('../../../../index');

router.patch('/', (req, res) => {
    const { payload } = req.body;
    console.log(payload);
    philips.executeInstruction('setstate', payload)
    .then((result) => {
        console.log(result);
        res.sendStatus(200);
    })
    .catch((err) => {
        res.send(err);
    })

})

module.exports = router;