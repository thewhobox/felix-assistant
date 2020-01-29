const manager = require("./manage");
const fs = require("fs");

process.env.NTBA_FIX_319 = 1; // TODO check if fix is needed

var item = manager.getByKey("instances", process.argv[2]);

if(item == undefined) {
    console.log("Adapter nicht gefunden: " + process.argv[2])
    setTimeout(() => { throw new Error("notFound: " + process.argv[2]) }, 2000);
    return;
}

var adapterdir = __dirname.replace("manager", "node_modules") + "/a.felix." + item.adapter + "/";

var adapterx =  require("./adapter")(item);
var pkg;

try {
    pkg = JSON.parse(fs.readFileSync(adapterdir + "package.json"))
} catch(e) {
    process.send({type: "log", data: "Cannot start " + process.argv[2] + " cause package.json not exists or corrupt."})
    process.exit(2);
    return;
}

var adapter = require(adapterdir + pkg.main);

if(adapter == undefined) {
    process.send({type: "log", data: "Cannot start " + process.argv[2] + " cause " + pkg.main + " not exists"})
    process.exit(3);
    return;
}
adapter = adapter(adapterx);

adapter.log.info(item.key + " started!")
adapter.exit = () => { process.exit(1); }

process.on("message", (msg) => {
    switch(msg.cmd) {
        case "log":
            //adapter.log.info(msg.data);
            break;
    }
});

process.title = "felix." + item.key;