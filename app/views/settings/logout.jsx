const React = require("react");

class Logout extends React.Component {
    constructor(props) {
        super(props);

        props.res.cookie("test", "nicht befugt", {path: "/"})
        props.res.redirect(decodeURIComponent("/index"));
    }

    render() {
        return ""
    }
}

module.exports = Logout;