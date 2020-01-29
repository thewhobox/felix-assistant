'use strict'

//stelle hintergrundlicht auf 30% und grün


var listSkills = require("../../data/brain/skills");
var listActions = require("../../data/brain/actions");
var listScenes = require("../../data/brain/scenes");

var commandList;
var commands;
var lastActivationWord;

var ttsUrl = "http://api.voicerss.org/?key=ae19e24b26fc48cc80e58bddac5b94b1&hl=de-de&src={text}&c=mp3";

async function processSpeech(speech) {
    speech = speech.toLowerCase();
    commands = speech.split(" und ");
    commandList = new Array();
    lastActivationWord = "";
    var answer = "";

    for (var i = 0; i < commands.length; i++) {

        if(commandList[i] && commandList[i].intent !== null)
            continue;

        var command = {};
        command.cmd = commands[i].trim();

        /*
        command = getScene(command);
        if (command.handled) {
            commandList.push(command);
            continue;
        }

        command = getSkill(command);
        if (command.handled) {
            commandList.push(command);
            continue;
        }
        */
        
        command = getAction(command, i);

        console.log("Action Command: ",command);
        
        
    }

    console.log("---------------------------------")
    console.log(commandList);

    var errorCount = 0;
    for (var i = 0; i < commandList.length; i++) {
        if (commandList[i].answer != undefined)
            answer += commandList[i].answer;
        if (commandList[i].error != undefined)
            errorCount += 1;
    }

    if (errorCount > 0)
        answer += "Ich konnte " + errorCount + " Befehle nicht erkennen.";

    if(commandList.length == 0)
        answer = "Ich konnte keinen Befehl erkennen."

    return { cmds: commandList, answer: answer }; // + answer
}


function getScene(command) {
    var words = command.cmd.split(" ");
    if (listScenes.triggers.indexOf(words[0]) == -1)
        return command;

    if (listScenes.scenes.indexOf(words[1]) != -1) {
        command.answer = "Ich habe die Szene für dich geschaltet.";
        command.action = "scene";
        command.value = words[1];
        command.handled = true;
        lastActionWord = words[0];
        return command;
    }
    return command;
}

function getSkill(command) {
    for (var i = 0; i < listSkills.length; i++) {
        var skill = listSkills[i];
        var patt = new RegExp(skill.sentence);
        if (patt.test(command.cmd)) {
            var matches = command.cmd.match(skill.sentence);
            var entities = {};

            for(var key in skill.valIndexes) {
                var index = skill.valIndexes[key];
                if(matches[index] == undefined)
                    entities[key] = null;
                else
                    entities[key] = matches[index];
            }
            console.log(entities);

            command.intent = skill.intent;
            command.entities = entities;
            command.handled = true;
            return command;
        }
    }
    return command;
}

function getAction(command, currIndex, recursing = false) {
    console.log("Brain chk full")
    for (var i = 0; i < listActions.length; i++) {
        var action = listActions[i];
        for (var y = 0; y < listActions[i].sentences.length; y++) {
            var regexpStr = action.sentences[y].string;
            var m = command.cmd.match(regexpStr);

            if(m != null) {
                var entities = {};

                for(var key in action.sentences[y].valIndexes) {
                    var index = action.sentences[y].valIndexes[key];
                    if(m[index] == undefined)
                        entities[key] = null;
                    else
                        entities[key] = removeSpaces(m[index]);
                }

                if(entities[action.sentences[y].needToFollow] !== null) {
                    command.intent = action.intent;
                    command.entities = entities;
                    lastActivationWord = m[1];
                    commandList.push(command);
                    return;
                }
            }
        }
    }
    console.log("Brain chk following")

    for (var i = 0; i < listActions.length; i++) {
        var action = listActions[i];
        for (var y = 0; y < listActions[i].sentences.length; y++) {
            var regexpStr = action.sentences[y].string;
            var m = command.cmd.match(regexpStr);

            if(m != null) {
                var entities = {};
                
                for(var key in action.sentences[y].valIndexes) {
                    var index = action.sentences[y].valIndexes[key];
                    if(m[index] == undefined)
                        entities[key] = null;
                    else
                        entities[key] = removeSpaces(m[index]);
                }

                if(entities[action.sentences[y].needToFollow] == null) {
                    command.temp = {};
                    command.temp.following = action.followingSentences;
                    command.temp.action = listActions[i];
                    command.temp.needed = action.sentences[y].needToFollow;
                    command.temp.intent = action.intent;
                    lastActivationWord = m[1];
                    getFollowingEntities(command, currIndex);
                } else {
                    command.intent = action.intent;
                    command.entities = entities;
                    lastActivationWord = m[1];
                    commandList.push(command);
                }

                if(command.intent != null)
                    return;
            }
        }
    }
    console.log("Brain chk last action word")

    if(recursing)
        return;

    command.cmd = lastActivationWord + " " + command.cmd;
    getAction(command, currIndex, true);
    return;
}

function getFollowingEntities(command, i) {
    var max = 0;
    var entities = [];
    var flagFound = false;

    for(var x = i+1; x < commands.length; x++) {
        var temp = { cmd: commands[x].trim() };
        
        temp = getFollowingEntities(temp, command.temp.following);
        if(temp !== null) {
            entities[x] = temp;
            max = x;
            flagFound = true;
            break;
        } else {
            entities[x] = { DeviceName: removeSpaces(commands[x].trim()) }
        }
    }

    if(!flagFound)
        return;

    for(var x = i+1; x <= max; x++) {
        var temp = {};
        temp.cmd = commands[x].trim();
        temp.intent = command.temp.intent;
        temp.entities = entities[x];
        temp.entities[command.temp.needed] = entities[max][command.temp.needed];
        delete temp.temp;
        commandList.push(temp);
    }

    command.intent = command.temp.intent;
    delete command.temp;
    commandList.push(command);
    return;
}

function removeSpaces(input) {
    var out = input;
    while(out.indexOf(" ") !== -1) {
        out = out.replace(" ", "");
    }
    return out;
}

module.exports.init = () => {}; //init;
module.exports.process = processSpeech;
module.exports.getTtsUrl = (text) => { return ttsUrl.replace("{text}", encodeURI(text)) };