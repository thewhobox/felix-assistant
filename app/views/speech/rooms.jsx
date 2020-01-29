const React = require('react');
const smanager =  require("./../../../manager/speechmanage")();

class Index extends React.Component {
    constructor(props) {
        super(props);

        if(props.method == "post") {
            if(props.req.body.action == "add")
                smanager.addRoom(props.req.body);
            else
                smanager.updateRoom(props.req.body);
        }
        if(props.req.query.delete) {
            smanager.removeRoom(props.req.query.delete);
            props.res.redirect("?")
        }

        this.rooms = smanager.getAll("rooms");
    }


  render() {
    return <div>
        <button data-target="dialog-add" className="btn modal-trigger">Hinzufügen</button>
        <table className="table">
            <thead>
                <tr>
                    <th style={{width: "100px"}}>Aktionen</th>
                    <th>Name</th>
                    <th>SiteId</th>
                </tr>
            </thead>
            <tbody>
                {Object.keys(this.rooms).map((item, index) => 
                    <Room key={index} item={this.rooms[item]} />
                )}
            </tbody>
        </table>

        <div id="dialog-add" className="modal">
            <form className='need-validation' id='formadd' method='post'>
                <input type="hidden" name="action" value="add" />
                <div className="modal-content">
                    <h4>Neuen Raum hinzufügen</h4>
                    <div className="row">
                        <div className="col s2"><label htmlFor='name'>Name:</label></div>
                        <div className="col s10"><input name='name' type='text' autoComplete='off' required /></div>
                    </div>
                    <div className="row">
                        <div className="col s2"><label htmlFor='siteId'>siteId:</label></div>
                        <div className="col s10"><input name='siteId' type='text' autoComplete='off' required /></div>
                    </div>
                </div>
                <div className="modal-footer">
                    <a className="modal-close btn-flat waves-effect waves-red">Abbrechen</a>
                    <input type="submit" className="btn-flat waves-effect waves-green" value="Hinzufügen" />
                </div>
            </form>
        </div>
        <div id="dialog-edit" className="modal">
            <form className='need-validation' id='formadd' method='post'>
                <input type="hidden" name="action" value="edit" />
                <input type="hidden" name="id" value="0" />
                <div className="modal-content">
                    <h4>Raum bearbeiten</h4>
                    <div className="row">
                        <div className="col s2"><label htmlFor='name'>Name:</label></div>
                        <div className="col s10"><input name='name' type='text' autoComplete='off' required /></div>
                    </div>
                    <div className="row">
                        <div className="col s2"><label htmlFor='siteId'>siteId:</label></div>
                        <div className="col s10"><input name='siteId' type='text' autoComplete='off' required /></div>
                    </div>
                    <div className="row selectId">
                        <div className="col s2"><label htmlFor='device_id'>Temperatur: </label></div>
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
                </div>
                <div className="modal-footer">
                    <a className="modal-close btn-flat waves-effect waves-red">Abbrechen</a>
                    <input type="submit" className="btn-flat waves-effect waves-green" value="Speichern" />
                </div>
            </form>
        </div>
    </div>
  }
}


class Room extends React.Component {
    render() {
        return <tr data-id={this.props.item.id}>
            <td>
                <a href={"?delete=" + this.props.item.id} className="btn-flat red-text"><i className="material-icons">delete</i></a>
                <a href={"?delete=" + this.props.item.id} className="btn-flat brown-text modal-trigger" data-target="dialog-edit"><i className="material-icons">edit</i></a>
            </td>
            <td>{this.props.item.name}</td>
            <td>{this.props.item.siteId}</td>
        </tr>
    }
}

module.exports = Index;