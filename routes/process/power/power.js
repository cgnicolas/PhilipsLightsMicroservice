const router = require('express').Router();
const philips = require('../../../index');
router.post('/', (req, res) => {
    console.log(req.body.payload)
    philips.executeInstruction('power', req.body.payload)
    .then((result) => {
        res.status(200).send(result);
    })
    .catch((err) => {
        res.status(400).send(err.stack);
    })
})

module.exports = router;