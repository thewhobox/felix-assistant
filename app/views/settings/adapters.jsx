var React = require('react');
var DefaultLayout = require('../layouts/default');
const manager = require("../../../manager/manage");
const config = require("../../../conf")
const fs = require("fs");

class Index extends React.Component {
    render() {
        var jsfiles = ["/js/adapters/add.js"];
        var cssfiles = ["/css/adapters/add.css"];
        var adapters = manager.getAll();
        
        return <div>
            <input name="search" type="text" placeholder="Adapter suchen..." data-role="input"></input>
        <div id="adapterList">
            {adapters.map((adapter, value) =>
                <AdapterItem key={adapter.key} adapter={adapter} />
            )}
        </div></div>
    }
}

class AdapterItem extends React.Component {
    render() {
        var url = "/settings/adapters/install/" + this.props.adapter.key;

        var adapter = manager.getByKey("adapters", this.props.adapter.key);

        var version = ""; 
        var update = "";

        if (adapter !== undefined) {
            version = adapter.version
            if (adapter.update !== null && !config.update.autoupdate)
                update = adapter.update
        } else {
            var moduledir = __dirname.replace("/app/views/settings", "/node_modules");
            moduledir = moduledir.replace("\\app\\views\\settings", "\\node_modules");
            var pkg = JSON.parse(fs.readFileSync(moduledir + "/a.felix." + this.props.adapter.key + "/package.json").toString());
            version = pkg.version
        }

        return <div className="card" data-keys={this.props.adapter.keywords.join(",")}>
                <div className="card-image">
                    <img src={"/static/" + this.props.adapter.key + "/img/icon.png"} />
                    <a href={url} className="btn-floating halfway-fab"><i className="material-icons">add</i></a>
                </div>
                <div className="card-content p-2">
                    <span className="card-title activator grey-text text-darken-4">{this.props.adapter.name}<i className="material-icons right">more_vert</i></span>
                    <p>{version}&nbsp;{update}</p>
                    
                </div>
                <div className="card-reveal">
                    <span className="card-title grey-text text-darken-4">{this.props.adapter.name}<i className="material-icons right">close</i></span>
                    <p>{this.props.adapter.description}</p>
                </div>
            </div>
    }
}

module.exports = Index;