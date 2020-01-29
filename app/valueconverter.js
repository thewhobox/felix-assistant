'use strict';

let converters = {
    "converters": {
        "light.on": function(input) { return input ? "An": "Aus"}
    },
    "units": {
        "number.percent": "%",

        "time.ms": "ms",
        "time.h": "h",
        "time.s": "s",
        "time.m": "min",

        "level.db": "dB",
        "level.lux": "lux",
        "level.rotation": "°",
        "level.temp": "°C",
        "level.tempdiff": "K",
        "level.kph": "K/h",
        "level.speed": "m/s",
        "level.pressure": "Pa",
        "level.humidity": "%",
        "level.airflow": "m³/h",
        "level.ppm": "ppm",

        "light.temp": "K",
        "light.hue": "°",

        "length.mm": "mm",

        "current.ma": "mA",

        "temperatur": "°C"
    }
}

module.exports = converters;