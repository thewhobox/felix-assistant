const mqtt = require('mqtt');
const hostname = "mqtt://192.168.0.157";
const io = require('socket.io-client');


var handlers = {};


function Snips(config) {
    if(config.functions.hwleds) {
        this.hwleds = require("../leds");
        this.hwleds.init();
    }
    this.siteId = config.speech.siteId;

    this.conn = io("http://localhost:3000");

    let t2 = this;

    this.leds = {
        stop: (siteId) => {
            if(this.hwleds && siteId == this.siteId) this.hwleds.stop();
            t2.conn.emit("message", { to: "*", cmd: "speechChanged", value: { state: "stop", siteId }})
        },
        showListen: (siteId) => {
            if(this.hwleds && siteId == this.siteId) this.hwleds.showListen();
            t2.conn.emit("message", { to: "*", cmd: "speechChanged", value: { state: "listening", siteId }})
        },
        showSpeak: (siteId) => {
            if(this.hwleds && siteId == this.siteId) this.hwleds.showSpeak();
            t2.conn.emit("message", { to: "*", cmd: "speechChanged", value: { state: "speaking", siteId }})
        }
    }

    this.client  = mqtt.connect(hostname);
    let alreadystarted = false;

    this.client.on('connect', () => {
        console.log("[Snips Log] Connected to MQTT broker " + hostname);
        this.client.subscribe('hermes/#');
    });

    this.client.on('message', (topic, message) => {
        switch(topic) {
            case "hermes/asr/startListening":
                if(!alreadystarted) {
                    this.leds.showListen(JSON.parse(message).siteId);
                    alreadystarted = true;
                }
                break;
    
            case "hermes/asr/stopListening":
                this.leds.stop(JSON.parse(message).siteId);
                break;
    
            case "hermes/hotword/toggleOff":
                this.leds.showListen(JSON.parse(message).siteId);
                alreadystarted = true;
                break;
    
            case "hermes/tts/say":
                this.leds.showSpeak(JSON.parse(message).siteId);
                break;
    
            case "hermes/tts/sayFinished":
                alreadystarted = false;
                this.leds.stop(JSON.parse(message).siteId);
                break;
    
            default:
                if (topic.match(/hermes\/hotword\/.+\/detected/g) !== null) {
                    this.leds.showListen(JSON.parse(message).siteId);
                    alreadystarted = true;
                } else if (topic.match(/hermes\/intent\/.+/g) !== null) {
                    this.onIntentDetected(JSON.parse(message));
                }
        }
    });
}

Snips.prototype.onIntentDetected = async function(message) {
    console.log("Found Intent: " + message.intent.intentName)
    var intents = message.intent.intentName.split(":")

    if(intents[0] !== "thewhobox")
        return;

    var map = {
        LichtSchalten: ["light", "switch"],
        LichtDimmen: ["light", "dim"],
        LichtFarbe: ["light", "color"],
        RolloUpDown: ["rollo", "updown"],
        RolloPosition: ["rollo", "position"],
        TemperatureGet: ["temp", "get"],
        TemperatureGetSoll: ["temp", "getSoll"],
        TemperatureSet: ["temp", "set"],
        TemperatureEncrease: ["temp", "encr"],
        TemperatureDecrease: ["temp", "decr"]
    }

    if(intents[1] == "RolloUpDown"){
        var flag = false;
        for(var i = 0; i<message.slots.length; i++){
            var xy = message.slots[i];
            if(xy.rawValue == "prozent"){
                flag = true;
            }
        }
        if(flag) {
            intents[1] = "RolloPosition";
        }
    }

    if(intents[1] == "TemperatureGet"){
        if(message.input.toLowerCase().indexOf(" soll ") > -1) {
            intents[1] = "TemperatureGetSoll";
        }
    }

    var hs = map[intents[1]];
    var params = {
        intent: hs.join("."),
        entities: { },
        siteId: message.siteId,
        input: message.input,
        func: hs[1]
    }

    for(var index in message.slots) {
        var item = message.slots[index];
        params.entities[item.slotName] = typeof item.value.value === "string" ? item.value.value.toLowerCase() : item.value.value;
    }

    console.log("Parameter: " + JSON.stringify(params.entities));

    if(handlers[hs[0]] == undefined) {
        var handler = require("../handler/" + hs[0]);
        handlers[hs[0]] = new handler();
    }

    if(handlers[hs[0]][hs[1]] == undefined) {
        return "Der Intent " + hs.join(" ") + " wird nicht unterstützt.";
    } else {
        var handlerRes = await handlers[hs[0]][hs[1]](params);
                                //.catch(err => { console.log("Handler Error ", err)});

        console.log("Antwort: " + handlerRes.answer);

        this.client.publish("hermes/dialogueManager/endSession", JSON.stringify({ sessionId: message.sessionId, text: handlerRes.answer}));
        //return handlerRes.answer;
    }



    //this.client.publish("hermes/dialogueManager/endSession", JSON.stringify({ sessionId: message.sessionId, text: "Schon erledigt."}));
}

module.exports = (config) => { return new Snips(config) };