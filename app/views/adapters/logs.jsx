var React = require('react');
var DefaultLayout = require('../layouts/default');
const fs = require('fs');

class Index extends React.Component {
    constructor(props) {
        super(props);

        this.levels = { Alle: "Alle", info: "Info", warn: "Warnung", error: "Fehler", debug: "Debug" }
        this.entries = [];
        this.files = [];
        this.adapters = ["Alle"];

        this.firstfile = "";

        this.adapterkey = this.props.req.query.adapter || "Alle";
        this.loglevel = this.props.req.query.level || "Alle";

        fs.readdirSync("logs").forEach(item => {
            if (item.indexOf("-audit.json") == -1 && fs.statSync("logs\\" + item).isDirectory() == false ) {
                this.files.push(item.substr(0, item.indexOf(".")));
                this.firstfile = item;
            }
        });

        if (this.props.req.query["day"])
            this.firstfile = this.props.req.query.day + ".log";

        let logs = fs.readFileSync("logs\\" + this.firstfile).toString();

        logs.split("\n").forEach((item) => {
            if (item.indexOf("#") !== 0 && item != "" && item != "\n") {
                if (this.entries[this.entries.length - 1] == undefined) return;
                if (!this.entries[this.entries.length - 1].expand)
                    this.entries[this.entries.length - 1].expand = "";

                this.entries[this.entries.length - 1].expand = this.entries[this.entries.length - 1].expand + this.renderItem(item) + "<br>";
                return
            }



            if (item == "" || item.split(" - ").length < 3) return;

            item = item.substr(2);
            let t = item.substr(0, item.indexOf(" - "));
            item = item.substr(t.length + 3);
            let a = item.substr(1, item.indexOf(" - ") - 2);
            item = item.substr(a.length + 5);
            let l = item.substr(0, item.indexOf(": "));
            item = item.substr(l.length + 2);


            if (this.adapters.indexOf(a) == -1)
                this.adapters.push(a);


            if (this.adapterkey != "Alle" && this.adapterkey != a) return;
            if (this.loglevel != "Alle" && this.loglevel != l) return;

            this.entries.push({
                time: t,
                adapter: a,
                level: l,
                text: item.substr(0, 160),
                expand: ""
            })
        })

        this.entries = this.entries.reverse();
        this.files = this.files.reverse();
    }

    renderItem(item) {
        var out = "";
        var chars = item.split("");
        for(var i = 0; i < chars.length; i++) {
            if(chars[i] == " ")
                out = out + "&nbsp;";
            else {
                return out + item.substr(i);
            }
        }
    }

    render() {
        var jsfiles = ["/js/logs.js"];
        var cssfiles = ["/css/logs.css"];


        return <DefaultLayout title="Adapter - Felix" addcss={cssfiles} addjs={jsfiles} req={this.props.req} header="Log Einträge">
            <form id="dayform" method="get">
                <table className="table">
                    <thead>
                        <tr>
                            <th style={{ width: "135px" }}>
                                <select id="day" name="day" defaultValue={this.firstfile.substr(0, this.firstfile.lastIndexOf("."))}>
                                    {this.files.map((item, index) =>
                                        <LogDay key={index} item={item} />
                                    )}
                                </select>
                            </th>
                            <th style={{ width: "150px" }}>
                                <select id="adapter" name="adapter" defaultValue={this.adapterkey}>
                                    {this.adapters.map((item, index) =>
                                        <LogDay key={index} item={item} />
                                    )}
                                </select>
                            </th>
                            <th style={{ width: "130px" }}>
                                <select id="level" name="level" defaultValue={this.loglevel}>
                                    {Object.keys(this.levels).map((item, index) =>
                                        <LogDay key={index} value={item} item={this.levels[item]} />
                                    )}
                                </select></th>
                            <th></th>
                            <th>Text</th>
                        </tr>
                    </thead>
                    <tbody>
                        {this.entries.map((item, index) =>
                            <LogEntry key={index} item={item} />
                        )}
                    </tbody>
                </table>
            </form>
        </DefaultLayout>
    }
}


class LogDay extends React.Component {
    render() {
        return <option value={this.props.value || this.props.item}>{this.props.item}</option>
    }
}

class LogEntry extends React.Component {
    render() {
        let x = <td></td>
        let canexpand = this.props.item.expand ? "true" : "false";

        if (this.props.item.expand)
            x = <td><i className="material-icons">expand_more</i></td>

        return <tr data-canexpand={canexpand} className={this.props.item.level}>
            <td>{this.props.item.time}</td><td>{this.props.item.adapter}</td>
            <td>{this.props.item.level}</td>
            {x}
            <td><div>{this.props.item.text}</div><div style={{ display: "none" }} dangerouslySetInnerHTML={{ __html: this.props.item.expand }}></div></td>
        </tr>
    }
}

module.exports = Index;