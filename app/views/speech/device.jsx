var React = require('react');
var dmanage = require('../../../manager/devicemanage');
const smanager = require("./../../../manager/speechmanage")(true);
const functions = require("./functions");
const helper = require("./helper");


class Device extends React.Component {
    constructor(props) {
        super(props);

        if(props.req.query.delete) {
            smanager.removeDevice(props.req.params.id);
            props.res.redirect("/speech/devices");
            return;
        }


        this.device = smanager.getDevice(parseInt(props.req.params.id));//props.req.query.id));

        if(props.method == "post") {
            if(props.req.body.action == "add") {
                this.device.functions[props.req.body.function] = props.req.body.extern ? "#" + props.req.body.dpextern : props.req.body.datapoint;
                smanager.saveDevice(this.device);
            } else {
                let room = smanager.getRoomByKey(props.req.body.room.toLowerCase());
                this.device.name = props.req.body.name;
                this.device.smart = this.device.name.toLowerCase();
                this.device.room = props.req.body.room;
                this.device.type = props.req.body.type;
                this.device.siteId = room.siteId;
                this.device.roomonly = props.req.body.roomonly == "on";

                smanager.saveDevice(this.device);
            }
        }

        if(props.req.query.deleteFunc) {
            this.device.functions[props.req.query.deleteFunc] = undefined;
            smanager.saveDevice(this.device);
            props.res.redirect("?");
        }


        this.devices = new dmanage(this.device.adapter, true);

        helper.init(this.device.adapter, this.device.id);
        this.list = helper.getAllStates();


        var dps = {}

        for (var fname in functions) {
            var func = functions[fname];
            dps[fname] = { role: func.role, match: "", list: [] };

            this.list.forEach((dp) => {
                var state = dp.id.indexOf(".") != -1 ? dp.id.substr(dp.id.lastIndexOf('.') + 1) : dp.id;

                if (dp.type != func.type)
                    return;

                dps[fname].list.push(dp);

                if (state == func.match)
                    dps[fname].match = dp.id;
            });
        }

        this.viewDP = "var datapoints = " + JSON.stringify(dps);
        this.rooms = smanager.getAll("rooms") || [];
    }

    render() {
        if(this.props.req.query.delete) return "";
        
        return <div>
            <h3>{this.device.name}</h3>
            <button data-target="dialog-add" className="btn modal-trigger grey"><i className="material-icons left">add</i>Funktion</button>
            <a className="btn-flat brown-text modal-trigger" data-target="dialog-edit"><i className="material-icons">edit</i></a>
            <a href="?delete=true" className="btn-flat red-text"><i className="material-icons">delete</i></a>

            <table className="table">
                <thead>
                    <tr>
                        <th>Aktion</th>
                        <th>Funktion</th>
                        <th>Datenpunkt</th>
                    </tr>
                </thead>
                <tbody>
                    {Object.keys(this.device.functions).map((func, index) =>
                        <Function key={index} func={func} dp={this.device.functions[func]} />
                    )}
                </tbody>
            </table>


            <div id="dialog-add" className="modal">
                <form className='need-validation' id='formadd' method='post'>
                    <input type="hidden" name="action" value="add" />
                    <div className="modal-content">
                        <h4>Funktion hinzufügen</h4>
                        <div className="row">
                            <div className="col s2"><label htmlFor='function'>Funktion: </label></div>
                            <div className="col s10">
                                <select name='function'>
                                    <option value='onoff'>An/Aus</option>
                                    <option value='updown'>Auf/Aub</option>
                                    <option value='position'>Position</option>
                                    <option value='dim'>Dimmen</option>
                                    <option value='color'>Farbe</option>
                                </select>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col s2"></div>
                            <div className="col s10">
                                <label className="input-field">
                                    <input name="extern" type="checkbox" defaultChecked={false} />
                                    <span>Externer Datenpunkt</span>
                                </label>

                            </div>
                        </div>
                        <div data-showonextern="true" className="row">
                            <div className="col s2"><label htmlFor='dpextern'>Datenpunkt:</label></div>
                            <div className="col s10"><input name='dpextern' type='text' autoComplete='off' /></div>
                        </div>
                        <div data-hideonextern="true" className="row">
                            <div className="col s2"></div>
                            <div className="col s10">
                                <label className="input-field">
                                    <input name="filterrole" type="checkbox" defaultChecked />
                                    <span>Filtern nach Rolle</span>
                                </label>

                            </div>
                        </div>
                        <div data-hideonextern="true" className="row">
                            <div className="col s2"><label htmlFor='datapoint'>Datenpunkt: </label></div>
                            <div className="col s10"><select name='datapoint'></select></div>
                        </div>
                    </div>
                    <div className="modal-footer">
                        <a className="modal-close btn-flat waves-effect waves-red">Abbrechen</a>
                        <input type="submit" className="btn-flat waves-effect waves-green" value="Hinzufügen" />
                    </div>
                </form>
            </div>
            <div id="dialog-edit" className="modal">
                <form className='need-validation' method='post'>
                    <input type="hidden" name="action" value="edit" />
                    <input type="hidden" name="id" value={this.device._id} />
                    <div className="modal-content">
                        <h4>Gerät bearbeiten</h4>
                        <div className="row">
                            <div className="col s2"><label htmlFor='name'>Name:</label></div>
                            <div className="col s10"><input name='name' type='text' autoComplete='off' defaultValue={this.device.name} required /></div>
                        </div>
                        
                        {/* Also change in edit modal! */}
                        <div className="row">
                            <div className="col s2"><label htmlFor='type'>Typ: </label></div>
                            <div className="col s10">
                                <select name='type' className="validate" data-role='select' defaultValue={this.device.type}>
                                    <option value="light">Licht</option>
                                    <option value="rollo">Rollladen</option>
                                    <option value="other">Sonstiges</option>
                                </select>
                            </div>
                        </div>

                        <div className="row">
                            <div className="col s2"><label htmlFor='room'>Raum: </label></div>
                            <div className="col s10">
                                <select name='room' data-role='select' defaultValue={this.device.room}>
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
                                    <input name="roomonly" type="checkbox" defaultChecked={this.device.roomonly} />
                                    <span>Reagiert, wenn nur Raum anegegeben wird</span>
                                </label>
                            </div>
                        </div>
                    </div>
                    <div className="modal-footer">
                        <a className="modal-close btn-flat waves-effect waves-red">Abbrechen</a>
                        <input type="submit" className="btn-flat waves-effect waves-green" value="Speichern" />
                    </div>
                </form>
            </div>
            <script dangerouslySetInnerHTML={{ __html: this.viewDP }}></script>
        </div>
    }
}

class Function extends React.Component {
    render() {
        return <tr>
            <td><a href={"?deleteFunc=" + this.props.func} className="btn-flat red-text">Löschen</a></td>
            <td>{this.props.func}</td>
            <td>{this.props.dp}</td>
        </tr>
    }
}


class Option extends React.Component {
    render() {
        if (this.props.item.name == undefined) return "";
        return <option value={this.props.item.key}>{this.props.item.name}</option>;
    }
}


module.exports = Device;