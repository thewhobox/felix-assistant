#Doku Adaterentwicklung Info.json
Die Info Json beschreibt was der Adapter alles kann/darf und seine Konfiguration.  
  
Diese Seite verzichtet auf Anschauungsbeispiele. Bitte benutzen Sie dafür die [example info.json](examples/info.json)

## Haupteigenschaften
- [key](#key)
- [name](#name)
- [keywords](#keywords)
- [description](#description)
- [useSpeechLight](#useSpeechLight)
- [settings](#settings)
- [tabs](#tabs)
- [channels](#channels)
- [maintabs](#maintabs)
- [viewJsFiles](#viewjsfiles)
- [viewCssFiles](#viewcssfiles)

## Key
Der Key wird zur zurordnung verwendet. Er muss einzigartig sein und verwechslungen vermeiden!  
Bedinungen: Keine Sonder- und Leerzeichen, alles klein.

## Name
In Name wird der komplette Name des Adapter.  
Hier sind Sonder- und Lerrzeichen erlaubt.  
Er wird in der Adapterinstallationsseite angezeigt.

## Keywords
Ein Array mit Suchwörtern für den Adapter. Wird nur für Adapterinstallationsseite benötigt.

## Description
Beschreibung des Adapters. Wird in der Adapterinstallationsseite angezeigt, wenn man auf die drei Punkte klickt.

## useSpeechLight
Gibt an, ob der Adapter ["SpeechLight"](speechlight.md) unterstützt.

## Settings
### Page Objects
Hier werden die Einstellungen des Adapters angegeben.  
Typ: Object
Benötigte Eigenschaften:
 - title: Label
 - type: Akzeptiert werden text, number und checkbox
 - hint: Hinweis unter dem Eingabefeld
 - value: Standardwert
 - unit: Einheit für Eingabe (z.B.: ms, m/s, etc.)
Optionale Eigenschaften:
 - placeholder: Platzhalter

### Page Buttons
Benutzerdefinierte Buttons am Ende des Formulars.  
Kann verwendet werden für zum Beispiel automatisch Gateway finden.  
Typ: Array  
Benötigte Eigenschaften:
 - id: ID um später im Javascript Click-Event abfangen zu können
 - title: Beschriftung des Buttons

## Tabs
Array für zusätzliche Tabs in der Adapterübersicht.  
Kann verwendet werden um zum Beispiel eine Seite für die Gerätesuche oder Geräteeinstellung anzuzeigen.  
Typ: Array  
Benötigte Eigenschaften:
 - key: Key der Seite (gleicher Dateiname wie [View!](view.md#key))
 - title: Angezeigter Name der Seite

## Channels
Unterordner in den Datenpunkten des Adapters die beim erstellen der Instanz automatisch angelegt werden.  
Typ: Array  
Benötigte Eigenschaften:
 - id: Id des Unterordners
 - name: Angezeigter Name
 - parent: Übergeordneter Ordner ("" für root-Ordner)

## Maintabs
Zum hinzufügen von Tabs in das Hauptmenü an der linken Seite.  
Typ: Array  
Benötigte Eigenschaften:
 - key: Einzigartiger key
 - title: Angezeigter Name (%instance% wird durch Instanznummer ersetzt)
 - url: Url (%instance% wird durch Instanz key ersetzt)
 - reg: RegEx für alle Urls für die der Tab als aktiv angezeigt werden soll

## view Files
Festgelegte Dateien, die immer mit einer bestimmten [View](views.md) geladen werden sollen. (Siehe auch [static](static.md#festgelegets-laden))  
Type: Object  
Benötigte Eigenschaften:
 - Key ist key der View, Value ist dann ein Array mit URLs die hinzugefügt werden sollen.