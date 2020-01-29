'use strict';

var datadir = __dirname.replace("manager", "data");
const FileSync = require('lowdb/adapters/FileSync')

class devicemanager {

    constructor(adapter, second = false) {
        this.adapter = adapter;
        const datajson = new FileSync(datadir + '/database/devices-' + adapter + '.json')

        var low = require('lowdb');
        this.db = low(datajson)

        if (second)
            this.db.read();
        else
            this.db.defaults({ states: [], channels: [], devices: [], data: [] }).write();
    }

    reload() {
        this.db.read();
    }

    exists(table, id) {
        var old = this.db.get(table).filter({ id: id }).value().length;
        return old > 0;
    }

    getStatesByDevice(id) {
        return this.normalize(
            this.db.get("states").filter({ parent: id }).value()
        );
    }

    getForeignState(key) {
        return this.normalize(
            this.db.get("states").find({ id: key.substr(key.indexOf(".") + 1) }).value()
        );
    }

    getState(key) {
        return this.normalize(
            this.db.get("states").find({ id: key }).value()
        );
    }

    getAllStates() {
        return this.normalize(
            this.db.get("states").value()
        );
    }

    addState(state) {
        var old = this.db.get("states").find({ id: state.id }).value();

        if (old !== undefined) {
            return;
        }

        state.adapter = this.adapter;
        if (state.ack == undefined)
            state.ack = false;
        state.parent = state.id.substr(0, state.id.lastIndexOf("."));
        this.db.get("states").push(state).write();
    }


    setState(obj) {
        this.db.get("states")
            .find({ id: obj.id })
            .assign(obj)
            .write();
    }

    setForeignState(obj) {
        this.db.get("states")
            .find({ id: obj.key.substr(obj.key.indexOf(".") + 1) })
            .assign(obj)
            .write();
    }




    createChannel(obj) {
        var old = this.db.get("channels").find({ id: obj.id }).value();

        if (old !== undefined) {
            return;
        }

        if (obj.parent == undefined)
            obj.parent = obj.id.substr(0, obj.id.lastIndexOf("."));
            
        item.adapter = this.adapter;

        this.db.get("channels").push(obj).write();
    }

    getChannels(parent = "") {
        return this.normalize(
            this.db.get("channels").filter({ parent: parent }).value()
        );
    }

    saveDevice(obj) {
        this.db.get("devices")
            .find({ id: obj.id })
            .assign(obj)
            .write();
    }

    addDevice(item) {
        var old = this.db.get("devices").find({ id: item.id }).value();

        if (old !== undefined) {
            this.saveDevice(item);
            return;
        }

        if (item.channel == undefined)
            item.channel = item.id.substr(0, item.id.lastIndexOf("."));

        item.adapter = this.adapter;

        this.db.get("devices").push(item).write();
    }

    removeDevice(id) {
        this.db.get("devices")
            .remove({ id: id })
            .write();
    }

    getAllDevices() {
        return this.normalize(
            this.db.get("devices")
                .sortBy('id')
                .value()
        );
    }

    getDeviceById(id) {
        return this.normalize(
            this.db.get("devices")
                .find({ id: id })
                .value()
        );
    }

    getDevicesByFilter(filter) {
        return this.normalize(this.db.get("devices").filter(filter).value());
    }

    getDevicesBySmartName(name) {
        return this.normalize(this.db.get("devices").filter({ smartNameX: name }).value());
    }

    getDevicesByChannel(id) {
        return this.getDevicesByFilter({ channel: id });
    }


    // Database integration


    deleteValue(id) {
        this.db.get("data")
            .remove({ id: id })
            .write();
    }

    setValue(id, obj) {
        if (typeof obj == "string") {
            obj = { _value: obj, _type: "string" }
        }

        var count = this.normalize(this.db.get("data").filter({ id: id }).value()).length;

        if (count > 0) {
            this.db.get("data")
                .find({ id: id })
                .assign(obj)
                .write();
        } else {
            obj.id = id;
            this.db.get("data").push(obj).write();
        }
    }

    idExists(id) {
        var count = this.normalize(this.db.get("data").filter({ id: id }).value()).length;
        return count > 0;
    }

    getValue(id) {
        var obj = this.normalize(
            this.db.get("data").find({ id: id }).value()
        );

        if (obj == undefined)
            return obj;

        if (obj._type && obj._type == "string")
            return obj._value;

        return obj;
    }

    getValues(filter) {
        return this.normalize(
            this.db.get("data").filter(filter).value()
        );
    }

    getValuesWildcard(wildcard) {
        var out = [];
        this.db.get("data").value().forEach((item) => {
            var regex = new RegExp(wildcard);
            if (regex.test(item.id))
                out.push(item);
        })

        return this.normalize(out);
    }



    normalize(input) {
        if (input == undefined)
            return undefined;
        return JSON.parse(JSON.stringify(input));
    }

}

module.exports = devicemanager;