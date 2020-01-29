'use strict'
var request = require("request-promise-native");

function WheaterSkill() {}

WheaterSkill.prototype.get = async function (cmd) {
    if(cmd.entities.SkillPlace == null)
        cmd.entities.SkillPlace = "Karlsruhe";

    try {
        var data = await request.get("http://api.openweathermap.org/data/2.5/weather?q=" + cmd.entities.SkillPlace + "&appid=21c8fc29fb334a630e1f81f31215b3d4&units=metric&lang=de");
    } catch(err) {
        return { answer: "Es trat ein Fehler auf. Bitte stelle sicher, dass es den Ort " + cmd.entities.SkillPlace + " wirklich gibt."};
    }
    
    data = JSON.parse(data);
    var answer = "Es hat in " + cmd.entities.SkillPlace + " " + Math.floor(data.main.temp) + " Grad. " + data.weather[0].description + ".";
    return { answer: answer };
}

module.exports = WheaterSkill;