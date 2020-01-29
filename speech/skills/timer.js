'use strict'

var timerTO;


function skillTimer() {

}

skillTimer.prototype.set = function(skill) {
    timerTO = setTimeout(() => {
        var datadir = __dirname.replace("speech/skills", "data")
        spawn("ffplay", ["-nodisp", "-autoexit", datadir + "/sounds/alarm.mp3"]);
    }, skill.value * 60 * 1000);
    return { answer: "" };
}

skillTimer.prototype.stop = function(skill) {
    clearTimeout(timerTO);
    return { answer: "Timer wurde abgebrochen" };
}


module.exports = skillTimer;