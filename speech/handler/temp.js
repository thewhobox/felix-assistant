'use strict'

const io = require('socket.io-client');

const smanager = require("./../../manager/speechmanage")(true);
const rndanswers = ["Zu Befehl!", "Ei Ei. Captain!", "Schon erledigt.", "Kein Problem.", "Aber natürlich.", "Selbstverständlich.", "Okay.", "Erledigt.", "Ok.", "Schon passiert.", "Nein... Nur Spaß. Schon erledigt."];

function Action() {
    this.conn = io("http://localhost:3000");
}

Action.prototype.get = async function (skill) {
    let room = this.getRoom(skill);

    if(room == undefined)
        return { answer: "Ich konnte den Raum '" + skill.Room + "' nicht finden." };

    if (room.temp == undefined || room.temp == "")
        return { answer: "Der Raum '" + room.name + "' unterstützt die Funktion 'Temperatur abrufen' nicht." };

    let val = await this.getStateAsync(room.temp);
    val = val.toString().replace(".", ",");
    return { answer: "Es hat " + val + " Grad." };
}


Action.prototype.getSoll = async function (skill) {
    let room = this.getRoom(skill);

    if(room == undefined)
        return { answer: "Ich konnte den Raum '" + skill.Room + "' nicht finden." };

    if (room.tempsoll == undefined || room.tempsoll == ""){
        return { answer: "Der Raum '" + room.name + "' unterstützt die Funktion 'Temperatur Soll abrufen' nicht." };
    }


    let val = await this.getStateAsync(room.tempsoll);
    val = val.toString().replace(".", ",");
    return { answer: "Es soll " + val + " Grad sein." };
}


Action.prototype.set = function(skill) {
    let room = this.getRoom(skill);
    
    if(room == undefined)
        return { answer: "Ich konnte den Raum '" + skill.Room + "' nicht finden." };

    if (room.tempsoll == undefined || room.tempsoll == "")
        return { answer: "Der Raum '" + room.name + "' unterstützt die Funktion 'Temperatur setzen' nicht." };

    this.setState(room.tempsoll, skill.entities.Temperature);
    return { answer: this.getRndAnswer() };
}

Action.prototype.encr = async function(skill) {
    let room = this.getRoom(skill);

    if (room.tempsoll == undefined || room.tempsoll == "")
        return { answer: "Der Raum '" + room.name + "' unterstützt die Funktion 'Temperatur erhöhen' nicht." };

    let value = await this.getStateAsync(room.tempsoll);
    value += skill.entities.Diffrence;
    this.setState(room.tempsoll, value);
    return { answer: this.getRndAnswer() + " Ich habe sie auf " + value + " Grad gesetzt." };
}

Action.prototype.decr = async function(skill) {
    let room = this.getRoom(skill);

    if (room.tempsoll == undefined || room.tempsoll == "")
        return { answer: "Der Raum '" + room.name + "' unterstützt die Funktion 'Temperatur verringern' nicht." };

    let value = await this.getStateAsync(room.tempsoll);
    value -= skill.entities.Diffrence;
    this.setState(room.tempsoll, value);
    return { answer: this.getRndAnswer() + " Ich habe sie auf " + value + " Grad gesetzt." };
}


Action.prototype.getRoom = function(skill) {
    let room;
    if(skill.entities.Room == undefined) room = smanager.getRoomBySiteId(skill.siteId);
    else {
        let name = skill.entities.Room;
        if(name.indexOf("der ") > -1 || name.indexOf("dem ") > -1 || name.indexOf("im ") > -1)
            name = name.substr(name.indexOf(" ")+1);
        room = smanager.getRoomByKey(name);
    }
    return room;
}

Action.prototype.setState = function(id, val) {
    var instance = id.substr(id.indexOf(".")+1);
    instance = instance.substr(0, instance.indexOf("."));
    var adapter = id.substr(0, id.indexOf(".")+1) + instance;
    var state = id.substr(adapter.length+1);

    this.conn.emit("message", { to: adapter, cmd: "setForeignState", value: { id: state, value: val } });
}

Action.prototype.getStateAsync = async function(id) {
    var instance = id.substr(id.indexOf(".")+1);
    instance = instance.substr(0, instance.indexOf("."));
    var adapter = id.substr(0, id.indexOf(".")+1) + instance;
    var state = id.substr(adapter.length+1);

    return new Promise((resolve, reject) => {
        this.conn.emit("message", { to: adapter, cmd: "getForeignState", value: state }, (state) => {
            resolve(state.value);
        });
    });
}



Action.prototype.getRndAnswer = function () {
    return rndanswers[Math.floor(Math.random() * rndanswers.length)];
}

module.exports = Action;