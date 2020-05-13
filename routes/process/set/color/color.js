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
    console.log(color)
    const converted = rgbToHsl(color);
    payload = {
        ...payload,
        state: {
            ...payload.state,
            // xy: colorConvert(color),
            hue: converted.hue,
            sat: converted.sat,
        },
    }
    philips.executeInstruction('setstate', payload)
    .then((result) => {
        res.status(200).send(result);
    })
    .catch((err) => {
        console.log(err.stack);
        res.send(err);
    })

})

module.exports = router;



function rgbToHsl({r, g, b}){
    r /= 255, g /= 255, b /= 255;

    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    var h, s, v = max;
  
    var d = max - min;
    s = max == 0 ? 0 : d / max;
  
    if (max == min) {
      h = 0; // achromatic
    } else {
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
  
      h /= 6;
    }
    let hue = h * 65535;
    let sat = s * 254
    if(hue == 255){
        hue = 254
    }
    return {hue , sat, bri: v};
}