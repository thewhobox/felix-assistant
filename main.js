var config = require("./conf");

if(config["functions"]["web"])
{
    const app = require("./app/service");
    app.init();
}

const manager = require("./manager/service");
manager.init();

if(config["functions"]["speech"]) {
    const speech = require("./speech/service");
    speech.init();
}


process.title = "felix"