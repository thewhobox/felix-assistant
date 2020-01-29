'use strict';

const app = require("./app/service");
const manager = require("./manager/service");
const speech = require("./speech/service");

app.init();
manager.init();
speech.init(true);

process.title = "felix"
