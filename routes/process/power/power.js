const router = require('express').Router();
const philips = require('../../../index');
router.post('/', (req, res) => {
    console.log(req.body.payload)
    philips.executeInstruction('power', req.body.payload)
    .then(() => {
        res.sendStatus(200);
    })
    .catch((err) => {
        res.status(400).send(err.stack);
    })
})

module.exports = router;