var dmanage = require('../../../manager/devicemanage');
let startid, dmanager;

function getAllStates() {
    var list = [];
    list = addChannel(startid, list);
    list = addDevice(startid, list);
    list = addStates(startid, list);

    list = list.sort((a, b) => {
        var x = a.id.toLowerCase();
        var y = b.id.toLowerCase();
        return x < y ? -1 : x > y ? 1 : 0;
    });

    return list;
}


function addChannel(name, list) {
    var channels = dmanager.getChannels(name);

    channels.forEach((item) => {
        list = addChannel(item.id, list);
        list = addDevice(item.id, list);
        list = addStates(item.id, list);
    });

    return list;
}

function addDevice(name, list) {
    var devices = dmanager.getDevicesByChannel(name);
    devices.forEach((item) => {
        list = addChannel(item.id, list);
        list = addStates(item.id, list);
    });
    return list;
}

function addStates(id, list) {
    var states = dmanager.getStatesByDevice(id);
    states.forEach((state) => {
        if(state.write)
            list.push({ id: state.id.substr(startid.length + 1), name: state.name, type: state.type, role: state.role });
    });
    return list;
}



module.exports.getAllStates = getAllStates;
module.exports.init = (adapter, id) => {
    startid = id;
    dmanager = new dmanage(adapter, true);
}