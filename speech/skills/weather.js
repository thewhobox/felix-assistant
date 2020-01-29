'use strict'

function skillWeather() {
}


skillWeather.prototype.index = function(skill) {
    return { answer: "Es hat gerade 22 Grad und es ist sonnig." };
}




module.exports = skillWeather;