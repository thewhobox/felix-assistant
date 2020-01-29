var React = require('react');
var manager = require('../../../manager/manage');
const config = require("../../../conf")

class Index extends React.Component {
  render() {
    var instances = manager.getInstalled("instances");
    var contentClass = "normal"; // TODO check if necessary this.props.full ? "container-fluid" : "container";
    var jsfiles = [];
    var cssfiles = this.props.addcss ? this.props.addcss : [];

    jsfiles.push("/js/jquery.js");
    jsfiles.push("/js/materialize.js");
    jsfiles.push("/js/index.js");

    if(this.props.addjs)
        jsfiles = jsfiles.concat(this.props.addjs)

    var submenu = "";
    var maintabs = [];
    maintabs.push({key: "start", title: "Startseite", url: "/", reg: /\/index/});
    maintabs.push({key: "adapters", title: "Adapter", url: "/adapters/", reg: /\/adapters\/.*/});

    if(this.props.submenus &&  this.props.submenus.length > 0) {
        submenu = <ul className="submenu tabs grey darken-2">
                        {this.props.submenus.map((item, index) =>
                            <AdapterItem key={item.key} item={item} instance={this.props.instance} />
                        )}
                    </ul>
    }
    

    instances.forEach((item) => {
        var adapter = manager.getByKey("adapters", item.adapter);
        if(adapter.maintabs && item.isRunning) {
            var instance_index = item.key.substr(item.key.indexOf(".") + 1);
            adapter.maintabs.forEach((tab) => {
                tab.title = tab.title.replace("%instance%", instance_index == "0" ? "" : instance_index);
                tab.url = tab.url.replace("%instance%", item.key);
                maintabs.push(tab);
            })
        }
    });

    maintabs.push({ title: "Sprache", key: "speech", url: "/speech/devices", reg: /\/speech\/.*/})
    maintabs.push({ title: "Logs", key: "logs", url: "/adapters/logs", reg: /\/adapters\/logs/})
    maintabs.push({ title: "Einstellungen", key: "settings", url: "/settings/index", reg: /(\/settings\/.*|\/login\?return=.*)/})

    if(this.props.req) {
        maintabs.forEach((item) => {
            if(typeof(item.reg) == "object") {
                if(item.reg.test(this.props.req.originalUrl)) {
                    maintabs.forEach((item2) => item2.active = false);
                    item.active = true;
                } else 
                    item.active = false;
            } else {
                if(this.props.req.originalUrl == item.url) {
                    maintabs.forEach((item2) => item2.active = false);
                    item.active = true;
                } else 
                    item.active = false;
            }
        });
    }

    var logout = "";

    if(this.props.req.auth)
        logout = <ul id="nav-mobile" className="right hide-on-med-and-down"><li><a href="/logout">Logout</a></li></ul>

    return (
        <html>
            <head>
                <title>{this.props.title}</title>
                <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
                <link rel="stylesheet" href="/css/materialize.css" />
                <link rel="stylesheet" href="/css/index.css" />
                {cssfiles.map((item, index) =>
                    <CssFile key={index} file={item} />
                )}
            </head>
            <body>
                <div className="navbar-fixed">
                    <nav className="grey darken-3">
                        <div className="nav-wrapper">
                            <a style={{maxWidth: "80%"}} className="brand-logo truncate">{this.props.header || "Felix"}</a>
                            {logout}
                            <a href="#" data-target="slide-out" className="sidenav-trigger"><i className="material-icons">menu</i></a>
                        </div>
                    </nav>
                </div>

                <ul id="slide-out" className="sidenav sidenav-fixed">
                    <li className="logo">
                        <img src="/img/logo.png" />
                    </li>

                    {maintabs.map((item, index) =>
                        <MenuItem key={item.key} item={item} />
                    )}

                    <li className="hide-on-large-only"><a href="/settings">Logout</a></li>
                    
                </ul>

                {submenu}

                <main>
                    <div className={contentClass}>
                        {this.props.children}
                    </div>
                </main>

                {jsfiles.map((item, index) =>
                    <JsFile key={"jsfile" + index} file={item} />
                )}
            </body>
        </html>       
    )
  }
}

class MenuItem extends React.Component {
    render() {
        var classx = this.props.item.active ? "active " : "";
        var badge = this.props.item.badge ? <span className="badge">{this.props.item.badge}</span> : "";
        return <li className={classx + "waves-effect waves-red"}><a href={this.props.item.url}>{this.props.item.title}{badge}</a></li>;
    }
}

class AdapterItem extends React.Component {
    render() {
        if(this.props.item.show == false) return "";

        var url = this.props.item.url ? this.props.item.url : "/adapters/" + this.props.instance + "/" + this.props.item.key;
        var classx = this.props.item.active ? "active" : "";
        return (
            <li className="tab"><a className={classx} href={url} target="_self">{this.props.item.title}</a></li>
          )
    }
}

class JsFile extends React.Component {
    render() {
        return (
            <script src={this.props.file}></script>
          )
    }
}

class CssFile extends React.Component {
    render() {
        return (
            <link rel="stylesheet" href={this.props.file} />
          )
    }
}
module.exports = Index;