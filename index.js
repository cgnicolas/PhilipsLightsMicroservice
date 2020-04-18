const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const rp = require('request-promise');
const Client = require('./utils/Client');
const serviceDetails = require('./config/serviceDetails');
require('dotenv').config();


const app = express();
const port = require('./config/serviceDetails').service.port;
app.use(morgan('tiny'));
app.use(bodyParser.json());
const axios = require('axios');

const registrationOptions = {
    method: 'POST',
    url: process.env.SERVER_URI + '/services/register',
    data: serviceDetails,
    json: true
}

process.on('SIGINT', () => {
    console.log('Closed Connection');
    process.exit();
})

const philips = new Client(process.env.BRIDGE_IP, 'Autom8', 'LightsService', process.env.BRIDGE_USERNAME);

philips.emitter.on('Connected', () => {
    axios.request(registrationOptions)
    .then(() => {
        app.listen(port, () => {
            console.log("Listening on port: ", port);
            app.use('/', require('./routes/root'))
        })
    })
    .catch((err) => {
        console.error("Registration Failed due to error: ", err);
    })
})

module.exports = philips;