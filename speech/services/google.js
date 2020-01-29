'use strict';

const speech = require('@google-cloud/speech');
const Sonus = require('sonus');
const fs = require('fs');
const spawn = require('child_process').spawn;

let datadir = __dirname.replace("/speech/services", "/data/speech/google/");
let sounddir = __dirname.replace("/speech/services", "/data/sounds/");
var stopCallback = null;
var handlers = {};
var brain;

function Brain(config, isDebug = false) {
    if(isDebug) return;

    if(config.functions.leds) {
        this.leds = require("../leds");
        this.leds.init();
    } else {
        this.leds = {
            stop: function() {},
            showListen: function() {},
            showSpeak: function() {}
        }
    }

    brain = require("../brains/" + config.nlu.default);

    console.log("Felix is now listening to hotword.");
    this.playSound("success");

    var client = new speech.SpeechClient({
        projectId: "annular-aria-236803", //adapter.config.gProjectId,
        keyFilename: datadir + 'keyfile.json'
    });


    //home/pi/felix-assistant/data/speech/google/services/felix.pmdl

    const hotwords = [{ file: datadir + 'felix.pmdl', hotword: 'felix', sensitivity: 0.4 }];
    const sonus = Sonus.init({ hotwords, language: "de-DE", recordProgram: "arecord", resource: datadir + 'common.res' }, client);

    Sonus.start(sonus);


    sonus.on('hotword', (index, keyword) => {
        console.log("hotword");
        this.playSound("listening");
        this.leds.showListen();
    });

    sonus.on('error', error => {
        console.log("error", error);
        this.leds.stop();
    });

    sonus.on('final-result', async (result) => {
        console.log("result ", result);
        if(result == ""){
            console.log("leeres Result");
            this.leds.stop();
            return;
        }
        console.log("Speech ", result);
        var res = await brain.process(result).catch(err => { console.log("Brain Error!", err)});
        var answers = [];

        if(res == undefined) {
            this.leds.stop();
            this.playSound("error");
            return;
        }

        console.log("Brain Res ", res)

        for(var i = 0; i < res.cmds.length; i++) {
            var answ = await this.processResult(res.cmds[i]).catch(err => { console.log("Process Error", err)});
            if(answ != "")
                answers.push(answ);
        }

        if(res.answer !== "")
            answers.push(res.answer);

        var playedSomething = false;

        for(var i = 0; i < answers.length; i++) {
            if(answers[i].indexOf("sound:") === 0) {
                this.playSound(answers[i].substr(6));
                playedSomething = true;
            } else if (answers[i] != "") {
                this.playFile(brain.getTtsUrl(answers[i]));
                playedSomething = true;
            }
        }

        if(!playedSomething)
            this.playSound("success");

        this.leds.stop();
    });
}

Brain.prototype.processResult = async function(result) {
    var intent = result.intent.toLowerCase().split(".");
    if(handlers[intent[0]] == undefined) {
        var handler = require("../handler/" + intent[0]);
        handlers[intent[0]] = new handler();
    }

    if(handlers[intent[0]][intent[1]] == undefined) {
        return "Der Intent " + result.intent + " wird nicht unterstützt.";
    } else {
        result.siteId = "default";
        var handlerRes = await handlers[intent[0]][intent[1]](result);
                                //.catch(err => { console.log("Handler Error ", err)});
                                console.log("handler res: ", handlerRes);
        if(handlerRes.stopCallback) {
            if(stopCallback != null)
                this.processResult(stopCallback);
            
            stopCallback = handlerRes.stopCallback;
        }
        return handlerRes.answer;
    }
}

Brain.prototype.playSound = function(file) {
    spawn("ffplay", ["-nodisp", "-autoexit", sounddir + file + ".mp3"]);    
    //spawn("ffmpeg", ["-i", datadir + "sounds/" + file + ".mp3", "-f", "alsa", "hw:0,1"]);
}

Brain.prototype.playFile = function(file) {
    spawn("ffplay", ["-nodisp", "-autoexit", file]);
}

module.exports = Brain;