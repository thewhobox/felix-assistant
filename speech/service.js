'use strict';


function init(isDebug = false) {
    const config = require("../conf");
    if(isDebug) {
        config.functions.hwleds = false;
    }

    let service = require("./services/" + config.speech.stt)(config);
}

module.exports.init = init;