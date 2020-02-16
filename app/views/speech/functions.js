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
    },
    updown: {
        match: "direction",
        type: "direction",
        role: "rollo.direction"
    },
    position: {
        match: "position",
        type: "number",
        role: "state.position"
    }
}

module.exports = functions;