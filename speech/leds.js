var rpio = require('rpio')
rpio.init({
    mapping: 'gpio',
    gpiomem: false
})

var stop = false;
var writeBuffer;
var bufferLength;
var writeBuffer;
var isNotEnabled;

function init() {
    bufferLength = 12 * 4
    writeBuffer = Buffer.alloc(bufferLength, 'E0000000', 'hex')
    bufferLength += 4
    writeBuffer = Buffer.concat([Buffer.alloc(4, '00000000', 'hex'), writeBuffer], bufferLength)
    
    rpio.spiBegin()
    rpio.spiChipSelect(1)
    rpio.spiSetClockDivider(120)
    rpio.open(5, rpio.OUTPUT, rpio.LOW)
}

function sendLeds() {
    rpio.spiWrite(writeBuffer, bufferLength)
}

function setLed (n, brightness, r, g, b) {
    n *= 4
    n += 4
    writeBuffer[n] = brightness | 0b11100000
    writeBuffer[n + 1] = b
    writeBuffer[n + 2] = g
    writeBuffer[n + 3] = r
}


async function showListen() {
    if(isNotEnabled)
        return;

    start();
    var offset = 0;
    var end = false;

    while(!stop && !end) {
        for(var i = 0; i < 12; i++) {
            setLed(i, offset, 10, 255, 10);
        }
        offset++;
        sendLeds();
        await setSleep(25);
        if(offset == 18)
            end = true;
    }

    for(var i = 0; i < 12; i++) {
        setLed(i, 0, 0, 0, 0);
    }
    sendLeds();

    offset = 0;
    var toSet = 0;
    while(!stop) {
        for(var i = 0; i < 12; i++) {
            setLed(i, toSet, 10, 255, 10);
            sendLeds();
            await setSleep(50);
        }
        //change brightness
        if(toSet == 5)
            toSet = 0;
        else
            toSet = 5;
    }
}

async function showSpeak() {
    start(); 
    var end = false;
    var offset = 5;
    var toadd = 1;

    while(!stop && !end) {
        for(var i = 0; i < 12; i++) {
            if(i % 2 == 0)
                setLed(i, offset, 10, 255, 10);
            else
                setLed(i, offset, 255, 10, 10);
        }
        offset = offset + toadd;
        sendLeds();
        if(offset > 18 || offset < 6) {
            toadd = toadd * -1;
        }
        await setSleep(25);
    }
    
    rpio.write(5, rpio.LOW);
}

async function showFinish() {
    stop = true; 
    var end = false;
    var offset = 0;

    /*while(!end) {
        for(var i = 0; i < 12; i++) {
            setLed(i, offset, 10, 255, 10);
        }
        offset++;
        sendLeds();
        await setSleep(25);
        if(offset == 18)
            end = true;
    }*/
    
    for(var i = 0; i < 12; i++) {
        setLed(i, 0, 10, 255, 10);
    }
    sendLeds();
    
    
    rpio.write(5, rpio.LOW);
}

function setSleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function start() {
    stop = false;
    rpio.write(5, rpio.HIGH);
}
  
module.exports.init = init;
module.exports.stop = showFinish;
module.exports.showListen = showListen;
module.exports.showSpeak = showSpeak;