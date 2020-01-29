var listSkills = [
    {
        "name": "weather",
        "action": "index",
        "sentence": "wie ist das wetter[ ]{0,1}[(in)]*[ ]{0,1}\\b([a-zA-Z]*)\\b",
        "valIndexes": {"SkillDate": 2, "SkillPlace": 1},
        "intent": "Wheater.Get"
    },{
        "name": "timer",
        "action": "set",
        "sentence": "(stell|setze) den timer [a-z]* (eine|[0-9]{1,2})",
        "valIndexes": {"time": 2},
        "intent": "Timer.Set"
    }
]

module.exports = listSkills;