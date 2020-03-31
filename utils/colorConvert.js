const CC = require('cie-rgb-color-converter');
const SCC = require('simple-color-converter');

module.exports = (color) => {
    let newColor = new SCC({
        hex6: color,
        to: 'rgb'
    });
    let col = newColor.color;
    let xy = CC.rgbToXy(col.r, col.g, col.b);
    xy = [xy.x, xy.y]
    return xy;
}