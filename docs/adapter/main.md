# Doku Adapterentwicklung Main.js
Die Datei Main.js ist das herz des Adapters. Dort sitzt die ganze Logik.  

## Inhalt:
- [Aufbau](#aufbau)
- [Adapter Parameter](#adapter-parameter)
- [Funktionen Reagieren](#funktionen-reagieren)
- [Funktionen Agieren](#funktionen-agieren)
- [Eigenschaften](#eigenschaften)


## Aufbau
Der Aufbau eines Adapter ist ser einfach gehalten.  
Der "Konstruktor" heißt üblicherweise *startAdapter* und bekommt einen Parameter übergeben *base*.  
Der Parameter *base* sollte dann in einer lokalen Variable gespeichert werden um jederzeit darauf zugreifen zu können, denn diese enthält alle [agierende Funktionen](#funktionen-agieren).  
Der Konstruktor **MUSS** den Parameter wieder zurück geben.  
  
Am **Ende** der Datei muss der Konstruktor exportiert werden.  
  
Beispiel eines Konstruktors:
```javascript
let adapter;

function startAdapter(base) {
    adapter = base;
    return base;
}


module.exports = startAdapter;
```

## Adapter Parameter
Der im Konstruktor übergebene Parameter hat mehrere Funktionen.  
Diese sind hier aufgeteilt in:
- [Funktionen reagieren](#funktionen-reagieren)  
  Funktionen auf die der Adapter reagieren kann.  
  Beispiel: State änderungen, Message, Stoppen des Adapters, ...
- [Funktionen Agieren](#funktionen-agieren)
  Funktionen mit denen der Adapter agieren kann.
  Beispiel: States ändern, States abfragen, Channels erstellen, ...

### Funktionen Reagieren
Folgende Funktionen sind vorhanden:
- [subscribe](#subscribe)
- [onStateChanged](#onstatechanged)
- [onStop](#onstop)
- [onSpeechChanged](onspeechchanged)

#### subscribe
```javascript
base.subscribe("*");
```
Mithilfe von Subscribe kann man angeben welche StateChanged Events man haben möchte.  
Wird benötigt für [onStateChanged](#onstatechanged)  
Typ: Pattern für Regex

#### onStateChanged
```javascript
base.onStateChanged(state);

function changed(state) { }
```
Wird aufgerufen, wenn sich ein [State!](../state.md) des Adapter ändert.  
Parameter ist der geänderte State.  
**Achtung:** Wird ebenso aufgeurfen, wenn ack = true. Falls nicht gewünscht:
```javascript
if (state.ack) return;
```

#### onStop
```javascript
base.onStop(stop);

function stop() { }
```
Wird aufgerufen, wenn der Adapter beendet wird.  
Bitte **alle** nicht erfolderlichen Variablen und Timeouts zurücksetzen!

#### onSpeechChanged
```javascript
base.onSpeechChanged(speechChanged);

function speechChanged(state, siteId) { }
```
Wird aufgerüfen, wenn sich der Status SpeechLight ändert.  
Dies passiert, wenn der User das Hotword sagt oder etwas sprachlich ausgegeben wird.  
Parameter sind:
- state: Folgende States sind vorhanden: listening, speeking, stop.  
- siteId: Name des Zimmers. (kann auch default sein)

### Funktionen Agieren
Dieser Teil ist etwas gekürzt, da es sonst den Ramen sprengen würde.  
Die Funktionsnamen sollten auch selbsterklärend sein.  
*Die ID ist innerhalb der Instanz nicht anzugeben. Nur bei Foreign*  

Folgende Funktionen sind vorhanden:
- **exit**(exitCode): Beendet den Adapter
 - exitCode: Integer, Code wegen Exit
- **sendMessage**(to, cmd, data): Sendet Daten an einen bestimmten empfänger
 - to: Empfänger (alle = *)
 - cmd: Kommando
 - data: Daten
- **setState**(id, value, ack): Setzt einen State auf den bestimmten Wert.
 - value = Wert
 - ack = Steuern/true - Kontrolle/false (optional, default = false)
- **setForeignState**: Setzt den Wert vom State eines anderen Adapters
 - id: ID mit Instanz
 - value: Wert
 - ack: Steuern/true - Kontrolle/false (optional)
- **setStatesList**(id, list): Setzt die Statesliste eines States
 - list: Objekt für mapping
- **getState**(id): Gibt den State für die ID zurück
- **getAllStates**(): Gibt alles States der Instanz zurück
- **getStatesByDevice**(id): Gibt alle States eines Gerätes zurück
- **deviceExists**(id): Gibt an ob ein Gerät bereits existiert
- **channelExists**(id): Gibt an ob ein Unterordner bereits existiert
- **stateExists**(id): Gibt an ob ein State bereits existiert
- **createDevice**(id, name)
 - name: Angezeigter Name
- **createChannel**(id, name)
 - name: Angezeigter Name
- **addState**(id, name, type, role, readwrite, initValue, states, assign)
 - name: Angezeigter Name
 - type: button, checkbox, string
 - role: onoff, light.bri, light.hue, ...
 - readwrite: 0 = nothing, 1 = read, 2 = write, 3 = both
 - initValue: Initialer Wert (optional, default = "")
 - states: States für mapping (siehe auch setStatesList)
 - assign: Objekt für spezielle Eigenschaften. ({ isHidden: true })

### Eigenschaften
Der Parameter base hat folgende Eigenschaften:
- io*: Socket Client
- settings: Enthält die Einstellungen der Instanz
- config: Adapter Config
- dmanager*: DeviceManager
- database: Datenbank für einfache Daten
 - **deleteValue**(id): Löscht Eintrag
 - **setValue**(id, value): Setzt Eintrag auf Wert
 - **idExists**(id): Gibt zurück ob Eintrag mit ID schon vorhanden
 - **getValue**(id): Gibt Eintrag zurück
 - **getValues**(filter): Gibt Einträge zurück (filter = { isHidden: true })
 - **getValuesWildcard**(wildcard): Gibt Einträge zurück (wildcard = pattern für regex)
- basedir: Ordnerpfad des Adapters
- instance: Instanz key (javascript.0)
- conn*: Socket verbindung
- log: Logger für den Adapter
 - info, error, warn, debug, silly