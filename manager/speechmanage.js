'use strict';

var datadir = __dirname.replace("manager", "data");
const FileSync = require('lowdb/adapters/FileSync')
var low = require('lowdb');
let db;

class speechmanager {

    constructor(second = false) {
        const datajson = new FileSync(datadir + '/database/speech.json')
        db = low(datajson)

        if(second)
            db.read();
        else
            db.defaults({ devices: [], rooms: [] }).write();
    }

    getAll(table) {
        return this.normalize(db.get(table).value());
    }

    addRoom(body) {
        var room = this.normalize(db.get("rooms").find({name: body.name}).value());
    
        if(room !== undefined) {
            return false;
        } else {
            var obj = {
                key: body.name.toLowerCase(),
                name: body.name,
                siteId: body.siteId,
                id: Math.round(Math.random() * 100000)
            }
            db.get("rooms").push(obj).write();
            return true;
        }
    }

    updateRoom(body) {
        db.get("rooms").find({id: parseInt(body.id)}).assign({ name: body.name, key: body.name.toLowerCase(), siteId: body.siteId, temp: body.device_id, tempsoll: body.device_id2 }).write();
    }

    removeRoom(id) {
        id = parseInt(id)
        db.get("rooms").remove({ id: id }).write();
    }

    getRoomByKey(key) {
        return this.normalize(db.get("rooms").find({key}).value());
    }

    getRoomBySiteId(siteId) {
        return this.normalize(db.get("rooms").find({siteId}).value());
    }




    addDevice(device) {
        var d = this.normalize(db.get("devices").find({name: device.name, room: device.room}).value());
        var room = db.get("rooms").find({key: device.room}).value();

        if(d !== undefined) {
            return false;
        } else {
            var obj = {
                name: device.name,
                room: device.room,
                key: device.device_id,
                siteId: room.siteId,
                type: device.type,
                functions: {},
                roomonly: device.roomonly == "on",
                id: device.device_id.substr(device.device_id.replace(".", "-").indexOf(".") + 1),
                adapter: device.device_id.substr(0, device.device_id.replace(".", "-").indexOf(".")),
                smart: device.name.toLowerCase(),
                _id: Math.round(Math.random() * 100000)
            }
            db.get("devices").push(obj).write();
            return obj;
        }
    }

    saveDevice(device) {
        db.get("devices").find({_id: device._id}).assign(device).write();
    }


    removeDevice(id) {
        id = parseInt(id)
        db.get("devices").remove({ _id: id }).write();
    }

    getDevice(did) {
        return this.normalize(db.get("devices").find({_id: did}).value());
    }

    getDevices(filter) {
        return this.normalize(db.get("devices").filter(filter).value());
    }

    getDeviceByName(name) {
        return this.normalize(db.get("devices").find({smart: name}).value());
    }

    getDeviceByRoom(name) {
        return this.normalize(db.get("devices").filter({room: name}).value());
    }





    normalize(input) {
        if(input == undefined)
            return undefined;
        return JSON.parse(JSON.stringify(input));
    }

}

module.exports = (second = false) => new speechmanager(second);