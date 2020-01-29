const React = require("react");
const DefaultLayout = require("../layouts/default");

class Login extends React.Component {
    constructor(props) {
        super(props);
        this.message = "";

        if(props.method == "post") {
            if(props.req.body.password == "pass1234") {
                props.res.cookie("test", "ich bin befugt das zu sehen", {path: "/"})
                props.res.redirect(decodeURIComponent(props.req.query.return || "/index"));
            } else {
                this.message = <span className="red-text">Falsches Passwort</span>;
            }
        }
    }
    render() {
        return <DefaultLayout header="Login" req={this.props.req}>
            <form method="post" style={{textAlign: "center", width: "300px", margin: "auto"}}>
                <p>Bitte authentifiziere dich um Einstellungen vorzunehmen.</p>
                <input name="password" type="password" />
                {this.message}<br />
                <input className="btn" type="submit" />
            </form>
            <script dangerouslySetInnerHTML={this.script}></script>
        </DefaultLayout>
    }
}

module.exports = Login;