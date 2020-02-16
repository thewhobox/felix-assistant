'use strict'

const io = require('socket.io-client');

const smanager = require("./../../manager/speechmanage")(true);
const rndanswers = ["Zu Befehl!", "Ei Ei. Captain!", "Schon erledigt", "Kein Problem", "Aber natürlich", "Selbstverständlich", "Okay", "Erledigt", "Ok", "Schon passiert", "Nein... Nur Spaß. Schon erledigt"];
const colorToHue = {
    pink: { hue: 350, sat: 25 },
    violett: { hue: 300, sat: 45 },
    lila: { hue: 300, sat: 100 },
    blau: { hue: 240, sat: 100 },
    hellblau: { hue: 195, sat: 25 },
    türkis: { hue: 180, sat: 100 },
    grün: { hue: 120, sat: 100 },
    hellgrün: { hue: 120, sat: 40 },
    gelb: { hue: 60, sat: 100 },
    orange: { hue: 39, sat: 100 },
    braun: { hue: 25, sat: 86 },
    rot: { hue: 0, sat: 100 },
    weiß: { hue: 299, sat: 5 },
    aquamarin: { hue: 160, sat: 50 }
}


function Action() {
    this.conn = io("http://localhost:3000");
}

Action.prototype.switch = function (skill) {
    let value;
    let devices = this.getDevices(skill, "onoff", "Ein Aus schalten");
    if (devices.answer != undefined) return devices;

    if (skill.entities.StateDevice == "aus")
        value = false;
    else
        value = true;

    devices.forEach((item) => {
        let id = item.id + "." + item.functions.onoff;
        let adapter = item.adapter;
        if(item.functions.onoff.indexOf("#") === 0) {
            id = item.functions.onoff.substr(1);
            let temp = id.split(".");
            adapter = temp[0] + "." + temp[1];
        }
        console.log("[action] switch - " + value + " -> " + id);
        this.conn.emit("message", { to: adapter, cmd: "setForeignState", value: { id, value: value } });
    });


    return { answer: this.getRndAnswer() };
}

Action.prototype.dim = function (skill) {
    let devices = this.getDevices(skill, "dim", "dimmen");
    if (devices.answer != undefined) return devices;

    var toset = skill.entities.StateDevice;

    if(typeof toset == "string") {
        if (toset.indexOf("und") != -1 && toset != "hundert") {
            var x = toset.split("und");
            toset = this.getInt(x[0].trim()) + this.getInt(x[1].trim());
        } else {
            toset = this.getInt(toset);
        }
    }

    devices.forEach((item) => {
        let id = item.id + "." + item.functions.dim;
        let adapter = item.adapter;
        if(item.functions.dim.indexOf("#") === 0) {
            id = item.functions.dim.substr(1);
            adapter = id.substr(0, id.indexOf("."));
        }
        console.log("[action] dim - " + toset + " -> " + id);
        this.conn.emit("message", { to: adapter, cmd: "setForeignState", value: { id, value: toset } });
    });
    return { answer: this.getRndAnswer() };
}


Action.prototype.color = function (skill) {
    let devices = this.getDevices(skill, "color", "Farbe setzen");
    if (devices.answer != undefined) return devices;

    let color = colorToHue[skill.entities.Color];
    if(color == undefined) return { answer: "Die Farbe '" + skill.entities.Color + "' wird nicht unterstützt."}

    devices.forEach((item) => {
        let id = item.id + "." + item.functions.color;
        let idsat = item.id + ".sat";
        let adapter = item.adapter;
        if(item.functions.color.indexOf("#") === 0) {
            id = item.functions.color.substr(1);
            idsat = item.functions.color.substr(1, item.functions.color.lastIndexOf(".")-1) + ".sat";
            adapter = id.substr(0, id.indexOf("."));
        }
        console.log("[action] color - " + color.hue + " -> " + id);
        console.log("[action] color - " + color.sat + " -> " + idsat);
        this.conn.emit("message", { to: adapter, cmd: "setForeignState", value: { id, value: color.hue } });
        setTimeout(() => this.conn.emit("message", { to: adapter, cmd: "setForeignState", value: { id: idsat, value: color.sat } }), 500);
    });
    return { answer: this.getRndAnswer() };
}


Action.prototype.getDevices = function (skill, func, funcName) {
    let devices = [];
    if ((skill.entities.DeviceName == "alle" || skill.entities.DeviceName == "alles") && skill.entities.DeviceLocation == undefined) {
        let x = smanager.getAll("devices");
        x.forEach((device) => {
            if (device.functions && device.functions[func])
                devices.push(device);
        });

    } else if ((skill.entities.DeviceName == "alle" || skill.entities.DeviceName == undefined) && skill.entities.DeviceLocation != undefined) {
        let filter = { room: skill.entities.DeviceLocation };
        if(skill.entities.DeviceName !== "alle")
            filter.roomonly = true;
        var x = smanager.getDevices(filter);
        x.forEach((device) => {
            if (device.functions && device.functions[func])
                devices.push(device);
        });
    } else if (skill.entities.DeviceLocation != undefined && skill.entities.DeviceName != undefined) {
        var x = smanager.getDevices({ smart: skill.entities.DeviceName, room: skill.entities.DeviceLocation });
        x.forEach((device) => {
            if (device.functions && device.functions[func])
                devices.push(device);
        });

    } else if (skill.entities.DeviceLocation == undefined && skill.entities.DeviceName != undefined) {
        var x = smanager.getDevices({ smart: skill.entities.DeviceName });
        if (x.length == 0) return { answer: "Gerät '" + skill.entities.DeviceName + "' konnte nicht gefunden werden." }

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

Action.prototype.getInt = function (text) {
    var addend = 0;
    var multiplier = 1;

    if (text.indexOf("zehn") != -1) {
        text = text.substr(0, text.indexOf("zehn"));
        addend = 10;
    }

    if (text.indexOf("zig") > 0) {
        text = text.substr(0, text.indexOf("zig"));
        multiplier = 10;
    }

    switch (text) {
        case "":
            return addend;
        case "eins":
            return 1 * multiplier + addend;
        case "zwei":
        case "zwan":
            return 2 * multiplier + addend;
        case "drei":
            return 3 * multiplier + addend;
        case "vier":
            return 4 * multiplier + addend;
        case "fünf":
            return 5 * multiplier + addend;
        case "sech":
        case "sechs":
        case "sex":
            return 6 * multiplier + addend;
        case "sieben":
        case "sieb":
            return 7 * multiplier + addend;
        case "ach":
        case "acht":
            return 8 * multiplier + addend;
        case "neun":
            return 9 * multiplier + addend;
        case "elf":
            return 11;
        case "zehn":
            return 10;
        case "dreißig":
            return 30;
        case "hundert":
            return 100;
    }
}

Action.prototype.getRndAnswer = function () {
    return rndanswers[Math.floor(Math.random() * rndanswers.length)];
}

module.exports = Action;
