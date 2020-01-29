var React = require('react');
var DefaultLayout = require('../layouts/default');
var AdapterContent;
const fs = require('fs');

class Index extends React.Component {
    constructor(props) {
        super(props);
        this.adapter = { key: "speech" }
        this.page = props.req.params["key"];

        this.menulist = []

        AdapterContent = require("./" + this.page);
    }

    render() {
        var jsfiles = ["/js/socket.io.js", "/js/global/selectId.js"]
        var cssfiles = ["/css/global/selectId.css"];

        if (fs.existsSync(__dirname.replace("speech", "js") + "/speech/" + this.page + ".js"))
            jsfiles.push("/js/speech/" + this.page + ".js")

        if (fs.existsSync(__dirname.replace("speech", "css") + "/speech/" + this.page + ".css"))
            cssfiles.push("/css/speech/" + this.page + ".css")

        this.menulist.push({ key: "rooms", url: "/speech/rooms", icon: "room", title: "Räume" });
        this.menulist.push({ key: "devices", url: "/speech/devices", icon: "devices", title: "Geräte" });
        this.menulist.push({ key: "device", show: false });

        this.activeItem = null;
        this.menulist.forEach((item) => {
            if (item.key == this.page) {
                item.active = true;
                this.activeItem = item;
            } else
                item.active = false;
        });

        return <DefaultLayout title="Sprache - Felix" full="true" addcss={cssfiles} addjs={jsfiles} submenus={this.menulist} header={"Sprache " + (this.activeItem.title || "Gerät bearbeiten")} req={this.props.req}>
            <AdapterContent adapter={this.adapter.key} method={this.props.method} req={this.props.req} res={this.props.res} />
        </DefaultLayout>
    }
}

module.exports = Index;