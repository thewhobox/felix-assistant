'use strict'
var request = require("request-promise-native");

var ttsUrl = "http://api.voicerss.org/?key=ae19e24b26fc48cc80e58bddac5b94b1&hl=de-de&src={text}&c=mp3";
var luisURL = "https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/88f8a7c0-9187-469d-ab0b-341f298735ce?verbose=false&timezoneOffset=-360&subscription-key=da96a3cb000b4855bdc9c5c1591f805e&q=";

async function processSpeech(speech) {
    speech = speech.toLowerCase();
    var commands = speech.split(" und ");
    var commandList = [];

    for (var i = 0; i < commands.length; i++) {
        var cmd = {};
        var result = await request(luisURL + encodeURI(commands[i]));
        var data = JSON.parse(result);

        cmd.cmd = commands[i];
        cmd.intent = data.topScoringIntent.intent;
        cmd.entities = {};

        for(var x = 0; x < data.entities.length; x++) {
            var ent = data.entities[x];
            cmd.entities[ent.type] = ent.entity;
        }

        commandList.push(cmd);
    }

    return { cmds: commandList, answer: "" }; // + answer
}

module.exports.init = () => {}; //init;
module.exports.process = processSpeech;
module.exports.getTtsUrl = (text) => { return ttsUrl.replace("{text}", encodeURI(text)) };