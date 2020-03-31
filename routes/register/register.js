const router = require('express').Router();
const axios = require('axios');
const serviceDetails = require('../../config/serviceDetails');

router.post('/', (req, res) => {
    const { details } = req.body;
    const { url } = details;
    console.log("Registering Service");
    if(url) {
        axios.post(url, serviceDetails)
        .then((response) => {
            res.status(200).send(response.data);
        })
        .catch((err) => {
            console.log("Failure");
            res.status(401).send(err);
        })
    } else {
        res.sendStatus(400);
    }
});

module.exports = router;