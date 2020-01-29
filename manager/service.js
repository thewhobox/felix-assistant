const winston = require('winston');
require('winston-daily-rotate-file');
const { combine, timestamp, label, printf } = winston.format;

const config = require("../conf.json");
const request = require("request-promise-native");
const os = require('os');
const fs = require('fs');
const updateNotifier = require('update-notifier');
const app = require('express')();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const manager = require("./manage");
const { fork, spawn } = require("child_process");
const pidusage = require("pidusage");
const dmanage = require("./devicemanage");
const converter = require("./../app/valueconverter");

var adapters = {};
var sockets = {};

function init() {
    io.on('connection', client => {
        var clientID = client.id;
        sockets[clientID] = { subscribes: [], socket: client, message: null };
        client.on('subscribe', (data) => socketSubscribe(data, clientID));
        client.on('subscribeMessage', (data) => socketSubscribeMessage(data, clientID));
        client.on('setState', (data) => setState(data, clientID));
        client.on('message', (data, cb) => sendMessage(data, clientID, cb));
    });

    server.listen(3000, () => {
        logger.info("Socket now listening on PORT 3000")
    });

    setTimeout(() => {
        loadAdapters();
    }, 1000);

    checkUpdates();
    setInterval(checkUpdates, 60000); //15 * 60000);
}

let isupdating = false;

async function checkUpdates() {
    return;
    var adapters = JSON.parse(fs.readFileSync(__dirname.replace("manager", "adapter-list.json")));

    for(var index in adapters) {
        if(isupdating) return;
        var adapterKey = adapters[index];
        console.log(adapterKey);

        let info = await request.get("http://mike:Mike4TW!@tenshi.ipv10.de:3000/mike/adapter." + adapterKey + "/raw/branch/master/info.json");
        info = JSON.parse(info);
        let adapter = manager.getByKey("adapters", adapterKey);

        if(adapter == undefined) continue;

        if(!info.hasOwnProperty("version")) continue;

        if((!config.update.beta && info.version.indexOf("-") >= 0) || adapter.version == info.version) {
            manager.save("adapters", {key: adapterKey, update: null, version: info.version})
        } else {
            if(config.update.autoupdate) {
                isupdating = true;
                if (os.platform() === "win32") { //check environment
                    var cmd = 'yarn.cmd'
                } else {
                    var cmd = 'yarn'
                }
                logger.info("now updating '" + info.name + "' from " + adapter.version + " to " + info.version);
                let erroroutput = "";
                let updater = spawn(cmd, ['add', "git+http://mike:Mike4TW!@tenshi.ipv10.de:3000/mike/adapter." + adapterKey + ".git"])
                .on("exit", (err) => {
                    logger.info(adapterKey + " wurde aktualisiert. (Code: " + err + ")");

                    if(err != 0) {
                        logger.error("Fehler beim Update von " + info.name + ":\r\n" + erroroutput);
                        return;
                    }
                    manager.update(adapterKey);
                    manager.save("adapters", {key: adapterKey, update: null, version: info.version});

                    var instances = manager.getInstancesByAdapter(adapterKey);

                    instances.forEach((instance) => {
                        stopAdapter(instance.key);

                        setTimeout(() => startAdapter(instance.key), 2000);
                    });

                    checkUpdates();
                })
                updater.stderr.on('data', function (buf) {
                    erroroutput = erroroutput + "\r\n" + buf;
                });
                updater.stdout.on('data', function (buf) {
                    console.log(buf.toString());
                });
            }
        }
    }

    return;

    let list = manager.getAll("package.json");

    for(var i = 0; i < list.length; i++) {
        if(isupdating) return;

        let pkg = list[i];
        var notifier = new updateNotifier.UpdateNotifier({pkg});
        let adapterkey = pkg.name.substr(pkg.name.lastIndexOf(".")+1);
        var update = await notifier.checkNpm().catch((e) => {console.log(e)} /*console.log("Update: ", e.message)*/); //TODO change to logger.warn
        if(update == undefined) { console.log("noupdate " +pkg.name); continue} 

        if((!config.update.beta && update.latest.indexOf("-") >= 0) || update.latest == update.current) {
            manager.save("adapters", {key: adapterkey, update: null, version: update.latest})
        } else {
            if(config.update.autoupdate) {
                isupdating = true;
                if (os.platform() === "win32") { //check environment
                    var cmd = 'npm.cmd'
                } else {
                    var cmd = 'npm'
                }
                logger.info("now updating '" + update.name + "' from " + update.current + " to " + update.latest);
                let erroroutput = "";
                let updater = spawn(cmd, ['install', update.name + "@" + update.latest, "--save-dev"])
                .on("exit", (err) => {
                    logger.info(adapterkey + " wurde aktualisiert. (Code: " + err + ")");

                    if(err != 0) {
                        logger.error("Fehler beim Update von " + pkg.name + ":\r\n" + erroroutput);
                        return;
                    }
                    manager.update(adapterkey);
                    manager.save("adapters", {key: adapterkey, update: update.latest, version: pkg.version});

                    var instances = manager.getInstancesByAdapter(adapterkey);

                    instances.forEach((instance) => {
                        stopAdapter(instance.key);

                        setTimeout(() => startAdapter(instance.key), 2000);
                    });

                    checkUpdates();
                })
                updater.stderr.on('data', function (buf) {
                    erroroutput = erroroutput + "\r\n" + buf;
                });
            } else {
                manager.save("adapters", {key: adapterkey, update: update.latest, version: update.current})
            }
        }
    }
}


function socketSubscribe(data, id) {
    sockets[id].subscribes.push(data);
}

function socketSubscribeMessage(data, id) {
    sockets[id].message = data;
}

function sendMessage(data, id, cb) {
    if(data.to == "system.manager") {
        handleMessage(data, cb);
        return;
    }
    
    for(var sockid in sockets) {
        if(data.to == "*" || sockets[sockid].message == data.to) {
            sockets[sockid].socket.emit("message", { cmd: data.cmd, data: data.value }, cb);
        }
    }
}

function setState(state, id) {
    for(var sockid in sockets) {
        for(var i = 0; i < sockets[sockid].subscribes.length; i++) {
            var sub = sockets[sockid].subscribes[i];
            
            var regex1 = RegExp(sub);
            var ret = regex1.test(state.key);
            
            if(ret) sockets[sockid].socket.emit("stateChanged", state);
        }
    }
}

async function handleMessage(data, cb) {
    switch(data.cmd) {
        case "adapterStateChange":
            if(data.value.start){
                startAdapter(data.value.key);
            } else {
                stopAdapter(data.value.key);
            }
            break;
        case "getAdapterInfo":
            let obj = { system: { mem: 0, cpu: 0 }, adapter: { mem: 0, cpu: 0 }};
            var x = await pidusage(process.pid);
            obj.system.mem = Math.round((x.memory / 1024 / 1024) * 100) / 100;
            obj.system.cpu = Math.round(x.cpu * 10) / 10;
            if(adapterprocess) {
                var ap = await pidusage(adapterprocess.pid);
                obj.adapter.mem = Math.round((ap.memory / 1024 / 1024) * 100) / 100;
                obj.adapter.cpu = Math.round(ap.cpu * 10) / 10;
            }
            for(let key in adapters) {
                obj[key] = {};
                let adapter = adapters[key];
                let isok = true;
                const stats = await pidusage(adapter.pid).catch(() => isok = false);
                if(isok) {
                    obj[key].mem = Math.round((stats.memory / 1024 / 1024) * 100) / 100;
                    obj[key].cpu = Math.round(stats.cpu * 10) / 10;
                } else {
                    obj[key].mem = 0;
                    obj[key].cpu = 0;
                }
            }
            cb(obj);
            break;
        case "getInstances":
            let out = [];
            var installed = manager.getInstalled();
            installed.forEach((item) => out.push(item.key) );
            cb(out.sort());
            break;
        case "getInstanceDPs":
            cb(getInstanceDPs(data.value));
    }
}

function getInstanceDPs(instance) {
    let dmanager = new dmanage(instance, true);
    
    let list = [];

    list = addChannel("", list, dmanager);
	list = addDevice("", list, dmanager);
    list = addStates("", list, dmanager);

    list = list.sort((a, b) => {
        var x = a.id.toLowerCase();
        var y = b.id.toLowerCase();
        return x < y ? -1 : x > y ? 1 : 0;
    })

    return list;
}



function addChannel(name, list, dm) {
    var channels = dm.getChannels(name);

    channels.forEach((item) => {
        list.push({ id: item.id, name: item.name, displaytype: "channel", depth: item.id.split(".").length, shortId: item.id.substr(item.id.lastIndexOf(".") + 1), icon: "folder", value: "", sortDepth: 0, parent: item.parent });
        addChannel(item.id, list, dm);
        addDevice(item.id, list, dm);
        addStates(item.id, list, dm);
    });

    return list;
}

function addDevice(name, list, dm) {
    var devices = dm.getDevicesByChannel(name);
    devices.forEach((item) => {
        item.key = item.adapter + "." + item.id
        item.icon = "phonelink";
        item.displaytype = "device";
        item.depth = item.id.split(".").length;
        item.shortId = item.id.substr(item.id.lastIndexOf(".") + 1);
        item.sortDepth = 1;
        list.push(item);
        addChannel(item.id, list, dm);
        addStates(item.id, list, dm);
    });
    return list;
}

function addStates(id, list, dm) {
    var states = dm.getStatesByDevice(id);
    states.forEach((state) => {
        state.depth = state.id.split(".").length;
        state.displaytype = "state";
        state.shortId = state.id.substr(state.id.lastIndexOf(".") + 1);
        state.sortDepth = 2;
        state.icon = "bookmark_border";
        state.key = state.adapter + "." + state.id;
        state.valuetext = state.value;
        if (converter[state.role]) {
            state.valuetext = converter[state.role](state.value);
        }
        delete state.parent;
        delete state.ack;
        delete state.sortDepth;
        list.push(state);
    });
    return list;
}




function loadAdapters() {
    var installed = manager.getInstalled();
    installed.forEach((item) => {
        if(item.autostart)
            startAdapter(item.key);
        else 
            manager.save("instances", { key: item.key, isRunning: false });
    });
}

let adapterprocess = null;
let tempErrOut;
let tempErrTO;

function startAdapter(key) {
    let instance = manager.getByKey("instances", key);

    if(config.system.mode == "secure" || (config.system.debugAsSecure && instance.settings.loglevel == "debug")) {
        if(adapters[key] !== undefined) {
            logger.warn(key + " läuft bereits");
            return;
        }

        var adapter = fork(__dirname + "/adapterRunner-secure.js", [key], { silent: true, execArgv: []});
            
        adapter.stdout.on("data", (data) => {
            data = data.toString().trim();
            if(data.indexOf("#") == 0 && data.indexOf(" - [") !== -1)
                console.log(data + " - Hilfs2");
            else {
                adapter.send({cmd: "log", data: data});
            }
        });
        
        adapter.stderr.on("data", (data) => {
            var data = data.toString().trim();

            tempErrOut = tempErrOut + data;

            clearTimeout(tempErrTO);
            tempErrTO = setTimeout(() => {
                logger.error(key + ": " + tempErrOut);
                tempErrOut = "";
            }, 500);
        });

        
        adapter.on("message", (data) => {
            switch(data.type) {
                case "log":
                    logger.info(data.data);
                    break;
            }
        })


        adapter.on("exit", (code, signal) => {
            if(code == null)
                logger.info("Adapter " + key + " wurde beendet.");
            else
                logger.error("Adapter " + key + " wurde mit Code " + code + " beendet.");
                
            sendMessage({ to: "system.frontend", cmd: "adapterStateChanged", value: { key: key, status: false }});
            manager.save("instances", { key: key, isRunning: false });
            delete adapters[key];
        })
        
        adapters[key] = adapter;

        sendMessage({ to: "system.frontend", cmd: "adapterStateChanged", value: { key: key, status: true }});
        manager.save("instances", { key: key, isRunning: true, autostart: true });
    } else if (config.system.mode == "compact") {
        if(adapterprocess == null) {
            adapterprocess = fork(__dirname + "/adapterRunner-compact.js", [key], { silent: true, execArgv: []});

            adapterprocess.stdout.on("data", (data) => {
                data = data.toString().trim();
                if(data.indexOf("#") == 0 && data.indexOf(" - [") !== -1)
                    console.log(data + " - Hilfs2");
                else {
                    logger.info("Adapterprozess data " + data);
                }
            });
            
            adapterprocess.stderr.on("data", (data) => {
                var data = data.toString().trim();
        
                tempErrOut = tempErrOut + data;
        
                clearTimeout(tempErrTO);
                tempErrTO = setTimeout(() => {
                    logger.error("Adapterprozess error " + tempErrOut);
                    tempErrOut = "";
                }, 500);
            });
        
            
            adapterprocess.on("message", (data) => {
                logger.info("Adapterprozess message " + JSON.stringify(data));
                switch(data.cmd) {
                    case "log":
                        logger.info(data.data);
                        break;
                    case "stop":
                        console.log("stopping " + data.key);
                        stopAdapter(data.key);
                        break;
                }
            })
        
        
            adapterprocess.on("exit", (code, signal) => {
                if(code == null)
                    logger.info("Adapterprozess wurde beendet.");
                else
                    logger.error("Adapterprozess wurde mit Code " + code + " beendet.");
            })
        }

        logger.info("starting " + key);
        adapterprocess.send({ cmd: "startAdapter", key: key });
        
        sendMessage({ to: "system.frontend", cmd: "adapterStateChanged", value: { key: key, status: true }});
        manager.save("instances", { key: key, isRunning: true, autostart: true });
        
    }
}

function stopAdapter(key) {
    let instance = manager.getByKey("instances", key);

    if(config.system.mode == "secure" || (config.system.debugAsSecure && instance.settings.loglevel == "debug")) {
        if(adapters[key] !== undefined) {
            adapters[key].kill();
            delete adapters[key];
            manager.save("instances", { key: key, autostart: false });
        }
        else
            logger.warn(key + " läuft nicht");
    } else if(config.system.mode == "compact") {
        logger.info("Adapter " + key + " wurde beendet.");
        if(adapterprocess !== null) {
            adapterprocess.send({ cmd: "stopAdapter", key: key });
            sendMessage({ to: "system.frontend", cmd: "adapterStateChanged", value: { key: key, status: false }});
            manager.save("instances", { key: key, isRunning: false, autostart: false });
        }
        else    
            logger.warn(key + " läuft nicht");
    }
}


myFormat = printf(({ level, message, label }) => {
    console.log(`# ${new Date(Date.now()).toLocaleTimeString()} - [${label}] - ${level}: ${message} Hilfs`); // TODO remove
    return `# ${new Date(Date.now()).toLocaleTimeString()} - [${label}] - ${level}: ${message}`;
});

logger = winston.createLogger({
    level: 'debug',
    format: combine(
        label({ label: "system" }),
        myFormat
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






module.exports.init = init;