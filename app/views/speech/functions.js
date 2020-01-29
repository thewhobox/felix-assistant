const functions = {
    onoff: {
        match: "on",
        type: "boolean",
        role: "onoff"
    },
    dim: {
        match: "bri",
        type: "number",
        role: "number.percent"
    },
    color: {
        match: "hue",
        type: "number",
        role: "light.hue"
    }
}

module.exports = functions;