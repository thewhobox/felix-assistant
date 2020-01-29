var listActions = [
    {
        "name": "switch",
        "sentences": [
            {
                "string": "(mach|mache|stelle|stell|setz|setze|schalt|schalte)+ (das|die|den)*[ ]*([a-z]+( licht)*)[ ]*(aus|ein|an)*",
                "valIndexes": {"DeviceName": 3, "StateDevice": 5},
                "needToFollow": "StateDevice"
            }
        ],
        "followingSentences": [
            {
                "string": "([a-z]+( licht)*)[ ](aus|ein|an)+",
                "valIndexes": {"DeviceName": 1, "StateDevice": 3}
            }
        ],
        "intent": "Light.Switch"
    },
    {
        "name": "dim",
        "sentences": [
            {
                "string": "(erhöhe|reduziere|mach|mache|stelle|stell|setz|setze|dimm|dimme)+ (das|die|den)*[ ]*([a-z]+( licht)*)[ ]*(auf |um )*([0-9]{0,3})*[ ]*(%|prozent)+",
                "valIndexes": {"DeviceName": 3, "StateDevice": 6, "ActionType": 1},
                "needToFollow": "StateDevice"
            }
        ],
        "followingSentences": [
            {
                "string": "([a-z]+( licht)*)[ ]*(auf |um )*([0-9]{0,3})*[ ]*(%|prozent)+",
                "valIndexes": {"DeviceName": 1, "StateDevice": 3}
            }
        ],
        "intent": "Light.Dim"
    },
    {
        "name": "color",
        "sentences": [
            {
                "string": "(mach|mache|stelle|stell|setz|setze)+ (das|die|den)*[ ]*([a-z]+( licht)*)[ ]*(auf )*([a-zäöü]*)",
                "valIndexes": {"DeviceName": 3, "StateDevice": 6},
                "needToFollow": "StateDevice"
            }
        ],
        "followingSentences": [
            {
                "string": "([a-z]+( licht)*)[ ]*(auf )*([a-zäöü]*)",
                "valIndexes": {"DeviceName": 1, "StateDevice": 3}
            }
        ],
        "intent": "Light.Color"
    }
]

module.exports = listActions;

/*
    {
        "name": "jal",
        "words": ["fahr", "fahre"],
        "values": ["hoch", "runter", "auf", "ab"],
        "intent": "Action.Jal"
    }
*/