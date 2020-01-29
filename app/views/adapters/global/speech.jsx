var React = require('react');
var dmanager = require("./../../../../manager/devicemanage");

class Index extends React.Component {
    constructor(props) {
        super(props);
        this.instance = props.instance;
        this.adapter = props.adapter;
        
        var x = new dmanager(this.instance.key, true);

        if(props.method == "post" && props.req.body.device != undefined) {
            var device = x.getDeviceById(props.req.body.device);
            device.useSpeechLight = true;
            device.siteId = props.req.body.siteid;
            x.saveDevice(device);
        }
        
        if(props.req.query.delete) {
            let tempDevice = x.getDeviceById(props.req.query.delete);
            tempDevice.useSpeechLight = undefined;
            x.saveDevice(tempDevice);
            props.res.redirect("?");
            return;
        }

        this.devices = x.getDevicesByFilter({useSpeechLight: true});
        this.allDevices = [];

        x.getAllDevices().forEach((item) => {
            let flagFound = false;
            this.devices.forEach((item2) => {
                if(item.id == item2.id)
                    flagFound = true;
            });
            if(!flagFound)
                this.allDevices.push(item);
        });
    }

    render() {
        return <div>
            <h1>Spracheinstellungen</h1>
            <button data-target="dialog-add" className="btn modal-trigger grey">Funktion</button>
            <p>Hier kannst du Geräte einstellen, die darauf reagieren sollen, wenn Felix etwas sagt oder zuhört.</p>


            <ul className="collection">
                {this.devices.map((item, index) =>
                    <Device key={index} item={item} />
                )}
            </ul>

            <div id="dialog-add" className="modal">
                <form className='need-validation' id='formadd' method='post'>
                    <div className="modal-content">
                        <h4>Gerät hinzufügen</h4>
                        <div className="row selectId">
                            <div className="col s2"><label htmlFor='device'>Gerät: </label></div>
                            <div className="col s10">
                            <div className="file-field input-field">
                                <div id="select_id" className="btn">
                                    <span>Auswählen</span>
                                </div>
                                <div className="file-path-wrapper">
                                    <input id="device" name="device" className="validate" type="text" autoComplete='off' required />
                                </div>
                                </div>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col s2"></div>
                            <div className="col s10">
                                <label className="input-field">
                                    <input name="color" type="checkbox" defaultChecked />
                                    <span>Farbe verwenden</span>
                                </label>

                            </div>
                        </div>
                        <div className="row">
                            <div className="col s2"><label htmlFor='siteid'>SiteId:</label></div>
                            <div className="col s10"><input name='siteid' type='text' autoComplete='off' defaultValue="default" required /></div>
                        </div>
                    </div>
                    <div className="modal-footer">
                        <a className="modal-close btn-flat waves-effect waves-red">Abbrechen</a>
                        <input type="submit" className="btn-flat waves-effect waves-green" value="Hinzufügen" />
                    </div>
                </form>
            </div>
        </div>
    }
}

class Option extends React.Component {
    render() {
        return <option value={this.props.item.id} data-color={this.props.item.hasColor ? "true":"false"}>{this.props.item.name}</option>;
    }
}

class Device extends React.Component {
    render() {
        
        return <li className="collection-item">{this.props.item.name}<a href={"?delete=" + this.props.item.id} className="secondary-content"><i className="material-icons">delete</i></a></li>;
    }
}

module.exports = Index;