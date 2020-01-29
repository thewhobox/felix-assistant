const winston = require('winston');
require('winston-daily-rotate-file');
const { combine, timestamp, label, printf } = winston.format;

class Adapter {
    constructor(config) {
        this.io = require('socket.io-client');
        this.settings = config.settings;
        this.config = config;
        var dmanage = require('./devicemanage');
        this.dmanager = new dmanage(config.key); //TODO: make private so adapter can't use it directly

        this.database = {
            deleteValue: (id) => this.dmanager.deleteValue(id),
            setValue: (id, value) => this.dmanager.setValue(id, value),
            idExists: (id) => this.dmanager.idExists(id),
            getValue: (id) => this.dmanager.getValue(id),
            getValues: (filter) => this.dmanager.getValues(filter),
            getValuesWildcard: (wildcard) => this.dmanager.getValuesWildcard(wildcard)
        }

        this.basedir = __dirname.replace("manager", "node_modules") + "/a.felix." + this.config.adapter;
        this.instance = this.config.key;
        
        this.conn = this.io("http://localhost:3000");
        this.conn.emit("subscribeMessage", this.config.key);
        this.conn.on("message", (data, cb) => {
            switch(data.cmd) {
                case "getForeignState":
                    cb(this.dmanager.getState(data.data));
                    break;
                case "setForeignState":
                    this.setState(data.data.id, data.data.value, data.data.ack);
                    break;
                case "speechChanged":
                    if(this._onspeechchanged)
                        this._onspeechchanged(data.data.state, data.data.siteId)
                default:
                    if(this._onmessage)
                        this._onmessage(data.cmd, data.data, cb);
            }
        });
        this.conn.on("error", () => {
            console.log("disconnected")
        })


        this.myFormat = printf(({ level, message, label }) => {
            return `# ${new Date(Date.now()).toLocaleTimeString()} - [${label}] - ${level}: ${message}`;
        });

        this.log = winston.createLogger({
            level: this.settings.loglevel,
            format: combine(
                label({ label: this.config.key }),
                this.myFormat
              ),
            transports: [
                new (winston.transports.DailyRotateFile)({
                    filename: 'logs/%DATE%.log',
                    datePattern: 'YYYY-MM-DD',
                    zippedArchive: true,
                    maxSize: '20m',
                    maxFiles: '14d'
                  }),
                  new winston.transports.Console()
            ]
          });
          
        return this;
    }

    
    _stop() {
        if(this._stopfunc)
            this._stopfunc();
    }

    exit() {
        this.adapter.log.warn("No Exit Function found")
    }

    onSpeechChanged(func) {
        this._onspeechchanged = func;
    }

    onStop(func) {
        this._stopfunc = func;
    }

    onStateChanged(func) {
        this.dmanager.reload();
        this.conn.on("stateChanged", (data) => func(data));
    }

    onMessage(func) {
        this._onmessage = func;
    }

    sendMessage(to, cmd, data) {
        this.conn.emit("message", { to: to, cmd: cmd, value: data });
    }

    subscribe(wildcard, foreign = false) {
        if(!foreign) wildcard = this.config.key + "." + wildcard;
        this.conn.emit("subscribe", wildcard)
    }

    setState(id, value, ack = false) {
        var state = this.dmanager.getState(id);
        if(state == undefined) return;

        var oldVal = state.value;
        state.value = value;
        state.ack = ack ? true:false;

        if(state.type == "boolean" && state.value === -1)
            state.value = !oldVal;

        if(state.type == "number") {
            state.value = parseInt(state.value);
            if(state.hasOwnProperty("max") && value > state.max)
                state.value = state.max;
            if(state.hasOwnProperty("min") && value < state.min)
                state.value = state.min;
        }

        this.dmanager.setState(state);
        state.tosetval = state.value;
        state.oldValue = oldVal;

        if(state.hasOwnProperty("linearM")) {
            var temp = state.linearM * state.value;
            if(state.hasOwnProperty("linearN"))
                temp = temp + state.linearN;
            state.tosetval = Math.round(temp);
        }

        if(state.hasOwnProperty("multiplier"))
            state.tosetval = Math.round(state.tosetval * state.multiplier);
        if(state.hasOwnProperty("divider"))
            state.tosetval = Math.round(state.tosetval / state.divider);

        state.key = this.config.key + "." + id;
        state.state = state.key.substr(state.key.lastIndexOf(".") + 1);

        this.conn.emit("setState", state);
    }

    setForeignState(id, value, ack = false) {
        var adapter = id.substr(0, id.indexOf("."));
        id = id.substr(id.indexOf(".")+1);
        this.conn.emit("message", { to: adapter, cmd: "setForeignState", value: { id: id, value: value, ack: ack }});
    }

    setStatesList(id, list) {
        var state = this.dmanager.getState(id);
        state.states = list;
        this.dmanager.setState(state);
    }

    getState(id) {
        return this.dmanager.getState(id);
    }

    getAllStates() {
        return this.dmanager.getAllStates();
    }

    getStatesByDevice(id) {
        return this.dmanager.getStatesByDevice(id);
    }

    deviceExists(id) {
        return this.dmanager.exists("devices", id);
    }

    channelExists(id) {
        return this.dmanager.exists("devices", id);
    }
    
    stateExists(id) {
        return this.dmanager.exists("devices", id);
    }



    createDevice(key, name) {
        var device = { id: key, name: name, channel: "" };
        if(key.indexOf(".") !== -1)
            device.channel = key.substr(0, key.lastIndexOf("."));

        this.dmanager.addDevice(device)
    }

    
    createChannel(key, name = "") {
        var channel = { id: key, name: name, parent: "" };
        if(key.indexOf(".") !== -1)
            channel.parent = key.substr(0, key.lastIndexOf("."));

        this.dmanager.createChannel(channel)
    }

    addState(key, name, type, role, readwrite, initValue = "", states = null, assign = null) {
        var state = {
            id: key,
            name: name, 
            type: type, 
            role: role,
            read: false,
            write: false,
            value: initValue,
            parent: "",
            adapter: this.config.key,
            ack: true
        }

        if(assign != null) {
            state = Object.assign(state, assign);
        }

        if(states !== null) {
            state.states = states;
        }

        switch(readwrite) {
            case 1:
                state.read = true;
                break;
            case 2:
                state.write = true;
                break;
            case 3:
                state.read = true;
                state.write = true;
                break;
        }

        if(key.indexOf(".") !== -1)
            state.parent = key.substr(0, key.lastIndexOf("."));

        this.dmanager.addState(state);
    }

}

module.exports = (config) => { return new Adapter(config) };