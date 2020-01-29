var React = require('react');
var fs = require('fs');
var DefaultLayout = require('../layouts/default');
var AdapterContent;

let moduledir = __dirname.replace("app/views/adapters", "node_modules");
moduledir = moduledir.replace("app\\views\\adapters", "node_modules");
let staticdir = "";
let staticurl = "";
let staticdir_global = "";
let staticurl_global = "";

const globalSites = ["datapoints", "settings", "log", "speech"];
const globalSiteNames = { "datapoints": "Datenpunkte", "settings": "Einstellungen", "log": "Logs", "speech": "Sprache" }

class Index extends React.Component {

    constructor(props) {
        super(props);

        this.page = props.req.params["handler"];
        this.manager = require('../../../manager/manage', true);

        if (props.req.params["key"] == "system") {
            this.adapter = { key: "system", name: "System" }
        } else if( props.req.params.key == "global") {
            this.adapter = { key: "global", name: "Global" }
        } else {
            this.instance = this.manager.getByKey("instances", props.req.params["key"]);
            this.adapter = this.manager.getByKey("adapters", this.instance.adapter);
        }



        if (globalSites.indexOf(this.page) !== -1) {
            this.title = "Felix - Adapter " + this.adapter.name + " " + globalSiteNames[this.page];
            AdapterContent = require("./global/" + this.page);

            staticdir_global = __dirname.replace("adapters", "");
            staticurl_global = "/";

            staticdir = moduledir + "/a.felix." + this.adapter.key + "/static/";
            staticurl = "/static/" + this.adapter.key + "/";
        } else {
            this.title = "Felix - Adapter " + this.adapter.name;

            var dir = __dirname.replace("app/views", "data");
            dir = __dirname.replace("app\\views", "data");

            AdapterContent = require(moduledir + "/a.felix." + this.adapter.key + "/views/" + this.page);

            staticdir = moduledir + "/a.felix." + this.adapter.key + "/static/";
            staticurl = "/static/" + this.adapter.key + "/";
        }
    }

    render() {
        var jsfiles = ["/js/socket.io.js", "/js/global/selectId.js"];
        //var jsDir = __dirname + "/" + this.adapter.key + "/js";
        var cssfiles = ["/css/global/selectId.css"];
        //var cssDir = __dirname + "/" + this.adapter.key + "/css";

        if (staticdir_global != "" && fs.existsSync(staticdir_global + "css/global/" + this.page + ".css"))
            cssfiles.push(staticurl_global + "css/global/" + this.page + ".css");

        if (fs.existsSync(staticdir + "css/" + this.page + ".css"))
            cssfiles.push(staticurl + "css/" + this.page + ".css");

        if (staticdir_global != "" && fs.existsSync(staticdir_global + "js/global/" + this.page + ".js"))
            jsfiles.push(staticurl_global + "js/global/" + this.page + ".js");

        if (fs.existsSync(staticdir + "js/" + this.page + ".js"))
            jsfiles.push(staticurl + "js/" + this.page + ".js");

        if (this.adapter.viewJsFiles && this.adapter.viewJsFiles[this.page]) {
            for(var file in this.adapter.viewJsFiles[this.page]) {
                file = this.adapter.viewJsFiles[this.page][file];
                file = file.replace("%systemLang%", "de") //TODO: replace with real syslang
                jsfiles.push(file);
            }
        }

        if (this.adapter.viewCssFiles && this.adapter.viewCssFiles[this.page]) {
            cssfiles = cssfiles.concat(this.adapter.viewCssFiles[this.page]);
        }

        this.menulist = [];
        this.activeItem = null;

        if (this.adapter.key != "system") {
            this.menulist.push({ key: "settings", icon: "cog", title: "Einstellungen" });
            this.menulist.push({ key: "datapoints", icon: "database", title: "Datenpunkte" });
        }
        
        if(this.adapter.useSpeechLight)
            this.menulist.push({ key: "speech", icon: "cog", title: "Sprache" });

        if (this.adapter.tabs) {
            this.menulist = this.menulist.concat(this.adapter.tabs.slice());
        }

        if (this.adapter.key != "system")
            this.menulist.push({ key: "delete", icon: "bin", title: "Löschen" });

        this.menulist.forEach((item) => {
            if (item.key == this.page) {
                item.active = true;
                this.activeItem = item;
            } else {
                item.active = false;
            }
        });

        var header = this.instance.key;
        if(this.activeItem)
            header = header + " " + this.activeItem.title;

        
        return (
            <DefaultLayout title={this.title} addjs={jsfiles} addcss={cssfiles} full="true" submenus={this.menulist} header={header} instance={this.instance.key}  req={this.props.req}>
                <input type="hidden" id="instance" defaultValue={this.instance.key} />
                <input type="hidden" id="settings" defaultValue={JSON.stringify(this.instance.settings)} />
                <AdapterContent adapter={this.adapter} instance={this.instance} method={this.props.method} req={this.props.req} res={this.props.res} />
            </DefaultLayout>
        )
    }
}

module.exports = Index;