'use strict';

var datadir = __dirname.replace("manager", "data");
var moduledir = __dirname.replace("manager", "node_modules");

var fs = require('fs');
try {
    fs.mkdirSync(datadir + '/database')
} catch {}

const FileSync = require('lowdb/adapters/FileSync')
const adapter = new FileSync(datadir + '/database/adapters.json')
var low = require('lowdb');
const db = low(adapter)

function manager(second = false) {
    if(second && fs.existsSync(datadir + '/database/adapters.json'))
        db.read();
    else {
        db.defaults({ adapters: [], instances: [] }).write();
    }
}

manager.prototype.reload = function() {
    db.read();
}

manager.prototype.save = function (table, obj) {
    db.get(table)
        .find({key: obj.key})
        .assign(obj)
        .write();
}

manager.prototype.add = function (table, key) {
    var adapter = this.getJson(key);
    var pkg = this.getPkg(key);
    var instance = {};
    var flagNotFound = true;
    var i = 0;

    if(db.get(table) .find({ key: key }).value() == undefined)
    {
        delete adapter.channels;
        delete adapter.keywords;
        db.get(table)
            .push(adapter)
            .write();
    }

    while(flagNotFound) {
        if(db.get("instances").find({key: adapter.key + "." + i}).value() == undefined){
            flagNotFound = false;
        } else {
            i++;
        }
    }
    
    instance.key = adapter.key + "." + i;
    instance.adapter = adapter.key;
    instance.settings = {};
    
    Object.keys(adapter.settings.pageobjects).map((key) => {
        instance.settings[key] = adapter.settings.pageobjects[key].value;
    });
    instance.settings.loglevel = "info";

    db.get("instances")
        .push(instance)
        .write();

    return adapter.key + "." + i;
}

manager.prototype.update = function(key) {
    var adapter = this.getJson(key);

    delete adapter.channels;
    db.get("adapters")
        .find({ key: key })
        .assign(adapter)
        .write();
}

manager.prototype.remove = function (table, key) {
    db.get(table)
        .remove({ key: key })
        .write();
}

manager.prototype.getJson = function (key) {
    return JSON.parse(fs.readFileSync(moduledir + "/a.felix." + key + "/info.json"));
}

manager.prototype.getPkg = function (key) {
    return JSON.parse(fs.readFileSync(moduledir + "/a.felix." + key + "/package.json"));
}

manager.prototype.hasRunningsInstance = function (key) {
    return db.get("instances").find({adapter: key, isRunning: true}).value() !== undefined
}

manager.prototype.getAll = function (file = "info.json", sort = true) {
    var adapterList = [];
    
    fs.readdirSync(moduledir).forEach(item => {
        if(item.indexOf("a.felix.") !== 0)
            return;

        adapterList.push(JSON.parse(fs.readFileSync(moduledir + "/" + item + "/" + file)));
    });

    if(sort)
        adapterList = adapterList.sort(this.compare);
    return adapterList;
}

manager.prototype.getUpdateCount = function () {
    return db.get("adapters")
        .filter((item) => item.update !== null)
        .value().length;
}

manager.prototype.getByKey = function (table, key) {
    db.read();
    return this.normalize(db.get(table)
        .find({ key: key })
        .value());
}

manager.prototype.getInstancesByAdapter = function (key) {
    return this.normalize(db.get("instances")
        .filter({ adapter: key })
        .value());
}

manager.prototype.getInstalled = function (table = 'instances') {
    return this.normalize(db.get(table).value());
}

manager.prototype.compare = function (a,b) {
    if (a.key < b.key)
      return -1;
    if (a.key > b.key)
      return 1;
    return 0;
}

manager.prototype.getNotInstalled = function () {
    var all = this.getAll();
    var notinstalled =  [];
    var installed = db.get('adapters').value();

    for(var i = 0; i < all.length; i++) {
        var flag = false;
        for(var x = 0; x < installed.length; x++) {
            if(installed[x].key == all[i].key)
                flag = true;
        }

        if(!flag)
            notinstalled.push(all[i]);
    }

    notinstalled.sort(this.compare);
    return notinstalled;
}

manager.prototype.normalize = function(input) {
    if(input == undefined)
        return undefined;
    return JSON.parse(JSON.stringify(input));
}

module.exports = new manager();