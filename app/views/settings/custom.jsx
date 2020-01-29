const React = require("react");
const DefaultLayout = require("../layouts/default");
const fs = require("fs");
var Content;

class Index extends React.Component {
	render() {
        var handler = this.props.req.params.handler;

        var basepath = __dirname.replace("/settings", "/");
        basepath = basepath.replace("\\settings", "\\");

        var jsfiles = ["/js/socket.io.js"];
        var cssfiles = [];

        if (fs.existsSync(basepath + "js/settings/" + handler + ".js"))
            jsfiles.push("/js/settings/" + handler + ".js");

        if (fs.existsSync(basepath + "css/settings/" + handler + ".css"))
            cssfiles.push("/css/settings/" + handler + ".css");

		let subs = [];
		subs.push({ key: "system", url: "/settings/index", title: "System" });
        subs.push({ key: "adapters", url: "/settings/adapters", title: "Adapter" });

        subs.forEach((item) => {
            if(item.url == this.props.req.url)
                item.active = true;
            else
                item.active = false;
        })

        Content = require("./" + this.props.req.params.handler);
        
		return <DefaultLayout addjs={jsfiles} addcss={cssfiles} req={this.props.req} res={this.props.res} header="Einstellungen" submenus={subs}>
            <Content />
		</DefaultLayout>
	}
}

module.exports = Index;