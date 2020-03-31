const router = require('express').Router();
const philips = require('../../../../index');

router.get('/', (req, res) => {
    philips.getRooms()
    .then((result) => {
       let rooms = result.filter((el) => el._data.type === "Room");
       let response = [];
       //Shaving irrelevant data
       rooms.forEach((room) => {
           response.push(room._data);
       })

       res.status(200).send(response);
    })
    .catch((err) => {
        res.send(err.stack)
    })
})

module.exports = router;