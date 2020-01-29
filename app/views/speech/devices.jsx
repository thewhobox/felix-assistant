var React = require('react');
const amanager = require("./../../../manager/manage");
const smanager = require("./../../../manager/speechmanage")(true);
var dmanager = require("./../../../manager/devicemanage");
const functions = require("./functions");
const helper = require("./helper");

class Index extends React.Component {
    constructor(props) {
        super(props);

        if (props.method == "post") {
            var device = smanager.addDevice(props.req.body);
            if (device === false) {
                console.log("Schon vorhanden")
                return;
            }

            if (props.req.body.auto && device !== false) {
                helper.init(device.adapter, device.id);
                var list = helper.getAllStates();
                var dps = {}

                for (var fname in functions) {
                    var func = functions[fname];
                    list.forEach((dp) => {
                        var state = dp.id.indexOf(".") != -1 ? dp.id.substr(dp.id.lastIndexOf('.') + 1) : dp.id;

                        if (dp.type != func.type)
                            return;

                        if (state == func.match && func.role == dp.role)
                            dps[fname] = dp.id;
                    });
                }

                device.functions = dps;
                smanager.saveDevice(device);
            }


            props.res.redirect("/speech/device/" + device._id);
            this.devices = [];
            this.adapters = [];
            this.rooms = [];
            return;
        }

        this.rooms = smanager.getAll("rooms") || [];
        this.devices = smanager.getAll("devices") || [];
    }

    render() {
        return <div>
            <button data-target="dialog-add" className="btn modal-trigger">Hinzufügen</button>

            <ul className="collection">
                {this.devices.map((item, index) =>
                    <Device key={index} item={item} />
                )}
            </ul>


            <div id="dialog-add" className="modal">
                <form className='need-validation' id='formadd' method='post'>
                    <div className="modal-content">
                        <h4>Neues Gerät hinzufügen</h4>
                        <div className="row">
                            <div className="col s2"><label htmlFor='name'>Name:</label></div>
                            <div className="col s10"><input name='name' className="validate" type='text' autoComplete='off' required /></div>
                        </div>

                        <div className="row selectId">
                            <div className="col s2"><label htmlFor='device_id'>Gerät: </label></div>
                            <div className="col s10">
                            <div className="file-field input-field">
                                <div id="select_id" className="btn">
                                    <span>Auswählen</span>
                                </div>
                                <div className="file-path-wrapper">
                                    <input id="device_id" name="device_id" className="validate" type="text" autoComplete='off' required />
                                </div>
                                </div>
                            </div>
                        </div>

                        {/* Also change in edit modal! */}
                        <div className="row">
                            <div className="col s2"><label htmlFor='type'>Typ: </label></div>
                            <div className="col s10">
                                <select name='type' className="validate" data-role='select'>
                                    <option value="light">Licht</option>
                                    <option value="other">Sonstiges</option>
                                </select>
                            </div>
                        </div>

                        <div className="row">
                            <div className="col s2"><label htmlFor='room'>Raum: </label></div>
                            <div className="col s10">
                                <select name='room' className="validate" data-role='select'>
                                    {this.rooms.map((item, index) =>
                                        <Option key={index} item={item} />
                                    )}
                                </select>
                            </div>
                        </div>
                        
                        <div className="row">
                            <div className="col s2"></div>
                            <div className="col s10">
                                <label className="input-field">
                                    <input name="auto" type="checkbox" defaultChecked />
                                    <span>Automatisch Funktionen zuordnen</span>
                                </label>

                            </div>
                        </div>
                        <div className="row">
                            <div className="col s2"></div>
                            <div className="col s10">
                                <label className="input-field">
                                    <input name="roomonly" type="checkbox" defaultChecked />
                                    <span>Reagiert, wenn nur Raum angegeben wird</span>
                                </label>

                            </div>
                        </div>
                    </div>
                    <div className="modal-footer">
                        <a className="modal-close btn-flat waves-effect waves-red">Abbrechen</a>
                        <input type="submit" className="btn-flat waves-effect waves-green" value="Hinzufügen" />
                    </div>
                </form>
            </div>
            <script dangerouslySetInnerHTML={this.devicelist}></script>
        </div>
    }
}

class Option extends React.Component {
    render() {
        if (this.props.item.name == undefined) return "";
        return <option value={this.props.item.key}>{this.props.item.name}</option>;
    }
}

class Device extends React.Component {
    render() {
        let icon = "help_outline";
        let color = "";
        switch(this.props.item.type) {
            case "light":
                icon = "emoji_objects";
                color = "yellow";
                break;
        }
        return <a className="collection-item avatar" href={"/speech/device/" + this.props.item._id}>
            <i class={"material-icons circle " + color}>{icon}</i>
            <span class="title">{this.props.item.name}</span>
            <p>{this.props.item.room}
            </p>
            </a>;
    }
}

module.exports = Index;