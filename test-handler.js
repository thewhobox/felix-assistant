var base = require("./speech/handler/light");
let handler = new base();

var params = {
    intent: "light.color",
    entities: {
        DeviceName: "test",
        Color: "grün"
    },
    siteId: "default",
    input: "schalte test aus"
}

start();

async function start() {
    var handlerRes = await handler[params.intent.split(".")[1]](params);
    console.log(handlerRes)
}