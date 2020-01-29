const manager = require("./manage");
const fs = require("fs");
let adapters =  {};

process.env.NTBA_FIX_319 = 1; // TODO check if fix is needed

process.on("message", (msg) => {
    switch(msg.cmd) {
        case "log":
            adapter.log.info(msg.data);
            break;

        case "startAdapter":
            startAdapter(msg.key)
            break;

        case "stopAdapter":
            stopAdapter(msg.key);
            break;
    }
});

process.on("uncaughtException", (error, origin) => {
    console.log("hier gab es einen unhandled exception!", error, origin);
    //TODO do something with it
})

function startAdapter(key) {
    var item = manager.getByKey("instances", key);
    
    if(item == undefined) {
        console.log("Adapter nicht gefunden: " + key)
        return;
    }
    
    var adapterdir = __dirname.replace("manager", "node_modules") + "/a.felix." + item.adapter + "/";
    
    var adapterx =  require("./adapter")(item);
    var pkg = JSON.parse(fs.readFileSync(adapterdir + "package.json"));
    
    var adapter = require(adapterdir + pkg.main)(adapterx);
    
    adapter.log.info(item.key + " started!")

    adapter._started = true;
    adapter.exit = () => {
        console.log("compact exit");
        process.send({cmd: "stop", key: key});
    }

    adapters[key] = adapter;
}

function stopAdapter(key) {
    if(adapters[key] != undefined) {
        adapters[key]._stop();
        delete adapters[key];
    }
}

process.title = "felix.adapters-compact"