'use strict';

var express = require('express');
var bodyParser = require("body-parser");
var cookieParser = require('cookie-parser')
var fs = require("fs");
var app = express();
var manager = require("../manager/manage");

function init() {
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser.json());
    app.use(cookieParser())

    app.use((req, res, next) => {
        if(req.cookies.test != "ich bin befugt das zu sehen") {
            req.auth = false;
        } else {
            req.auth = true;
        }

        if(req.url.startsWith("/settings") && req.cookies.test != "ich bin befugt das zu sehen") {
            res.redirect("/login?return=" + encodeURIComponent(req.url));
        } else {
            next();
        }
    });

    app.get('/', function (req, res) {
        res.redirect("/index");
    });

    app.get('/index', (req, res) => {
        res.render("index", {req, res});
    });

    app.get('/login', (req, res) => {
        res.render("settings/login", {req});
    });
    app.post('/login', (req, res) => {
        res.render("settings/login", { req, res, method: "post"});
    });
    app.get('/logout', (req, res) => {
        res.render("settings/logout", { req, res });
    });

    //---------Speech

    app.get('/speech/:key', (req, res) => {
        res.render("speech/index",  { req, res });
    });

    app.post('/speech/:key', (req, res) => {
        res.render("speech/index",  { req, res, method: "post" });
    });

    app.get('/speech/:key/:id', (req, res) => {
        res.render("speech/index",  { req, res });
    });

    app.post('/speech/:key/:id', (req, res) => {
        res.render("speech/index",  { req, res, method: "post" });
    });

    //---------Adapters

    app.get('/adapters', (req, res) => {
        var list = manager.getInstalled();
        res.render("adapters/index",  { instances: list, req });
    });

    app.get('/adapters/logs', (req, res) => {
        res.render("adapters/logs",  { req });
    });

    app.get('/adapters/:key/delete', (req, res) => {
        manager.remove("instances", req.params["key"]);
        if(fs.existsSync(__dirname.replace("app", "data") + "/database/devices-" + req.params["key"] + ".json"))
            fs.unlinkSync(__dirname.replace("app", "data") + "/database/devices-" + req.params["key"] + ".json");
        res.redirect("/adapters");
    });

    app.get('/adapters/:key/:handler', (req, res) => {
        res.render("adapters/custom", { req, res }); // params: req.params["handler"]
    });

    app.get('/adapters/:key/:handler/:id', (req, res) => {
        res.render("adapters/custom", { req, res }); // params: req.params["handler"]
    });

    app.post('/adapters/:key/:handler', (req, res) => {
        res.render("adapters/custom", { method: "post", req, res });
    });

    app.post('/adapters/:key/:handler/:id', (req, res) => {
        res.render("adapters/custom", { method: "post", req, res });
    });

    //---------Settings

    app.get('/settings', (req, res) => {
        res.redirect("/settings/index");
    });

    app.get('/settings/:handler', (req, res) => {
        res.render("settings/custom", { req, res });
    });
    
    app.get('/settings/adapters/install/:key', (req, res) => {
        var dmanage = require("../manager/devicemanage");
        
        var instance = manager.add("adapters", req.params["key"]);
        var channels = manager.getJson(req.params["key"]).channels;
        var dmanager = new dmanage(instance);

        if(channels) {
            channels.forEach((item) => {
                item.adapter = instance;
                dmanager.createChannel(item);
            });
        }

        res.redirect("/adapters/" + instance + "/settings");
    });

    app.set('view engine', 'jsx');
    app.engine('jsx', require('express-react-views').createEngine());

    var viewdirs = [__dirname + '/views'];

    //TODO replace a.felix. with end name
    fs.readdirSync(__dirname.replace("app", "node_modules")).forEach(item => {
        if(item.indexOf("a.felix.") !== 0)
            return;
        item = item.substr(8);
        app.use("/static/" + item, express.static(__dirname.replace("app", "node_modules") + '/a.felix.' + item + '/static'));
        viewdirs.push(__dirname.replace("app", "node_modules") + '/a.felix.' + item + '/views')
    });

    app.set('views', viewdirs);
    app.use(express.static(__dirname + '/views'));
    

    app.listen(81, function () {
        console.log('Felix WebServer is now listening on poprt 81!');
    });


}





module.exports.init = init;
