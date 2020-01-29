var React = require('react');
var DefaultLayout = require('../layouts/default');
var config = require("../../../conf");

class Index extends React.Component {
    render() {
        var jsfiles = ["/js/socket.io.js", "/js/adapters/index.js"];
        var cssfiles = ["/css/adapters/index.css"];

        var compactinfo = "";

        if(config.system.mode == "compact")
            compactinfo = <tr data-adapter="adapter">
                <td></td>
                <td></td>
                <td style={{ textAlign: "right" }}>Adapter:</td>
                <td data-role="infoMem"></td>
                <td data-role="infoCpu"></td>
            </tr>

        this.instances = this.props.instances.sort((a, b) => (a.key.toLowerCase() > b.key.toLowerCase()) ? 1 : -1);

        return <DefaultLayout title="Adapter - Felix" addjs={jsfiles} addcss={cssfiles} req={this.props.req} header="Installierte Adapter">
            <table className="table striped">
                <thead>
                    <th style={{ width: "24px" }}></th>
                    <th style={{ width: "164px" }}>Aktionen</th>
                    <th>Name</th>
                    <th style={{ width: "250px" }}>RAM</th>
                    <th style={{ width: "250px" }}>CPU</th>
                </thead>
                <tbody>
                    <tr data-adapter="system" style={{ borderBottom: "2px solid #e4e4e4" }}>
                        <td></td>
                        <td></td>
                        <td style={{ textAlign: "right" }}>System:</td>
                        <td data-role="infoMem"></td>
                        <td data-role="infoCpu"></td>
                    </tr>
                    {compactinfo}
                    {this.instances.map((instance, value) =>
                        <AdapterItem key={instance.key} instance={instance} />
                    )}
                    <tr data-adapter="total" style={{ borderTop: "2px solid #e4e4e4" }}>
                        <td></td>
                        <td></td>
                        <td style={{ textAlign: "right" }}>Total:</td>
                        <td data-role="infoMem"></td>
                        <td data-role="infoCpu"></td>
                    </tr>
                </tbody>
            </table>
        </DefaultLayout>
    }
}


class AdapterItem extends React.Component {
    render() {
        var stylestart = { display: "inline-block" };
        var stylestop = { display: "inline-block" };

        if (this.props.instance.isRunning)
            stylestop.display = "none";
        else
            stylestart.display = "none";

        return <tr data-adapter={this.props.instance.key}>
            <td><img style={{ height: "36px", width: "36px" }} src={"/static/" + this.props.instance.adapter + "/img/icon.png"} /></td>
            <td>
                <a data-action="stop" href="javascript:" title="Anhalten" style={stylestart} className="btn square green"><i className="material-icons">pause</i></a>
                <a data-action="start" href="javascript:" title="Starten" style={stylestop} className="btn square red"><i className="material-icons">play_arrow</i></a>
                <a href={"/adapters/" + this.props.instance.key + "/settings"} className="btn square black-text grey lighten-2"><i className="material-icons">settings</i></a>
                <a href={"/adapters/" + this.props.instance.key + "/datapoints"} className="btn square black-text grey lighten-2"><i className="material-icons">ballot</i></a>
                <a href={"/adapters/" + this.props.instance.key + "/delete"} className="btn square black-text grey lighten-2"><i className="material-icons">delete</i></a>
            </td>
            <td>{this.props.instance.key}</td>
            <td data-role="infoMem"></td>
            <td data-role="infoCpu"></td>
        </tr>;
    }
}

module.exports = Index;