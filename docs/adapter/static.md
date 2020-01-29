# Doku Adapterentwicklung statischer Inhalt

Im Root Ordner des Adapters gibt es den Ordner "static".  
Dieser wird beim start von Felix automatisch eingebunden, sodass per HTTP auf die enthaltenen Dateien zugegriffen werden kann.  
  
## Logo
Das Logo muss im Unterordner "img" sein.  
Die Datei muss den Namen "icon.png" haben.  
  
## Laden von JS- und CSS-Dateien

### Automatisches laden
Im Zusammenhang mit den [Views](views.md) werden vorhandene JS- oder CSS-Dateien (insofern sie denselben Namen wir die View haben) automatisch in die Seite eingebunden und vom Browser geladen.  
Beispiel: Es gibt die View "search.jsx"  
Folglich werden die Dateien automatisch eingebunden (wenn sie vorhanden sind):
- /adaptername/static/js/search.js
- /adaptername/static/css/search.css

### Festgelegets laden
Es gibt zudem auch noch die Möglichkeit für jede Ansicht in der Adapter [Info-Datei!](info.md#view-files) festzulegen, welche JS- oder CSS-Dateien geladen werden sollen.

## Laden von anderen Dateien
Sollte es notwendig sein andere Inhalte zu laden, kann dies geschehen durch folgenden URL Aufbau:  
http://meineipoderdoamin/static/*adaptername*/ + der Ordnerpfad im Static Ordner  
(adaptername durch [Adapter Key](info.md#key) ersetzen)  
  
Beispiel:  
Datei: /adaptername/static/img/meintollesbild.jpeg  
URL: http://meineipoderdomain/static/adaptername/img/meintollesbild.jpeg  
!Achtung! Bitte nicht die Instanz angeben, sondern nur den [Adapter Key](info.md#key)