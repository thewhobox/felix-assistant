'use strict'

const io = require('socket.io-client');

const smanager = require("./../../manager/speechmanage")(true);
const rndanswers = ["Zu Befehl!", "Ei Ei. Captain!", "Schon erledigt", "Kein Problem", "Aber natürlich", "Selbstverständlich", "Okay", "Erledigt", "Ok", "Schon passiert", "Nein... Nur Spaß. Schon erledigt"];

function Action() {
    this.conn = io("http://localhost:3000");
}

Action.prototype.updown = function (skill) {
    let value = false;
    let devices = this.getDevices(skill, "updown", "Hoch Runter");
    if (devices.answer != undefined) return devices;

    if(skill.entities.DeviceDirection == "runter" || skill.entities.DeviceDirection == "ab") {
        value = true;
    }

    devices.forEach((item) => {
        let id = item.id + "." + item.functions.updown;
        let adapter = item.adapter;
        if(item.functions.updown.indexOf("#") === 0) {
            id = item.functions.updown.substr(1);
            let temp = id.split(".");
            adapter = temp[0] + "." + temp[1];
        }
        console.log("[action] rollo - " + value + " -> " + id);
        this.conn.emit("message", { to: adapter, cmd: "setForeignState", value: { id, value: value } });
    });


    return { answer: this.getRndAnswer() };
}


Action.prototype.position = function (skill) {
    let devices = this.getDevices(skill, "position", "Hoch Runter");
    if (devices.answer != undefined) return devices;

    devices.forEach((item) => {
        let id = item.id + "." + item.functions.position;
        let adapter = item.adapter;
        let value = skill.entities.Position;
        if(item.functions.position.indexOf("#") === 0) {
            id = item.functions.position.substr(1);
            let temp = id.split(".");
            adapter = temp[0] + "." + temp[1];
        }
        console.log("[action] rollo - " + value + " -> " + id);
        this.conn.emit("message", { to: adapter, cmd: "setForeignState", value: { id, value: value } });
    });
    
    return { answer: this.getRndAnswer() };
}

Action.prototype.getDevices = function (skill, func, funcName) {
    let devices = [];

    var patt = new RegExp(/\balle\b/);
    if(patt.test(skill.input)){
        var x = smanager.getDevices({ type: "rollo", roomonly: true });
        x.forEach((device) => {
            if (device.functions && device.functions[func])
                devices.push(device);
        });
    } else if (skill.entities.DeviceLocation != undefined) {
        var x = smanager.getDevices({ room: skill.entities.DeviceLocation, type: "rollo", roomonly: true });
        x.forEach((device) => {
            if (device.functions && device.functions[func])
                devices.push(device);
        });
    } else if (skill.entities.DeviceLocation == undefined) {
        var x = smanager.getDevices({ siteId: skill.siteId, type: "rollo", roomonly: true });
        if (x.length == 0) return { answer: "Es konnten keine Rollläden in deinem Raum '" + skill.entities.DeviceLocation + "' gefunden werden." }

        if (x.length == 1) {
            if (x[0].functions == undefined || x[0].functions[func] == undefined) return { answer: skill.entities.DeviceName + " unterstützt die Funktion '" + funcName + "' nicht." } //TODO change to variable function
                devices.push(x[0]);
        } else {
            x.forEach((device) => {
                if (device.siteId == skill.siteId && device.functions && device.functions[func])
                    devices.push(device);
            });
        }

    } else if (skill.entities.DeviceLocation == undefined && skill.entities.DeviceName == undefined) {
        return { answer: "Es wurde kein Raum oder Geräte angegeben." }
    }

    if(devices.length == 0)
        return { answer: "Es konnten keine Geräte gefunden werden." }

    return devices;
}


Action.prototype.getRndAnswer = function () {
    return rndanswers[Math.floor(Math.random() * rndanswers.length)];
}

module.exports = Action;