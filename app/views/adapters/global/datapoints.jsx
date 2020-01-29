var React = require('react');
var dmanage = require('../../../../manager/devicemanage');
var converter = require("./../../../valueconverter");

class Index extends React.Component {

	constructor(props) {
		super(props);

		this.manager = require('../../../../manager/manage');

		this.adapter = this.props.adapter;
		this.instance = this.props.instance;

		this.devices = new dmanage(this.instance.key, true);
		this.list = [];

		this.addChannel("");
		this.addDevice("");
		this.addStates("");

		this.list = this.list.sort((a, b) => {
			var x = a.id.toLowerCase();
			var y = b.id.toLowerCase();
			return x < y ? -1 : x > y ? 1 : 0;
		})
	}


	addChannel(name) {
		var channels = this.devices.getChannels(name);

		channels.forEach((item) => {
			this.list.push({ id: item.id, name: item.name, displaytype: "channel", depth: item.id.split(".").length, shortId: item.id.substr(item.id.lastIndexOf(".") + 1), icon: "folder", value: "", sortDepth: 0, parent: item.parent });
			this.addChannel(item.id);
			this.addDevice(item.id);
			this.addStates(item.id);
		});
	}

	addDevice(name) {
		var devices = this.devices.getDevicesByChannel(name);
		devices.forEach((item) => {
			item.icon = "phonelink";
			item.displaytype = "device";
			item.depth = item.id.split(".").length;
			item.shortId = item.id.substr(item.id.lastIndexOf(".") + 1);
			item.sortDepth = 1;
			this.list.push(item);
			this.addChannel(item.id);
			this.addStates(item.id);
		});
	}

	addStates(id) {
		var states = this.devices.getStatesByDevice(id);
		states.forEach((state) => {
			state.depth = state.id.split(".").length;
			state.displaytype = "state";
			state.shortId = state.id.substr(state.id.lastIndexOf(".") + 1);
			state.sortDepth = 2;
			state.icon = "bookmark_border";
			state.key = state.adapter + "." + state.id;
			state.valuetext = state.value;
			if (converter[state.role]) {
				state.valuetext = converter[state.role](state.value);
			}
			this.list.push(state);
		});
	}


	render() {
		return (<div>
			<table className="table">
				<thead>
					<tr>
						<th>Key</th>
						<th>Name</th>
						<th style={{ width: "20%" }}>Wert</th>
						<th style={{ width: "20%" }}>Aktionen</th>
					</tr>
				</thead>
				<tbody>
					{this.list.map((item, index) =>
						<TreeItem item={item} key={index} />
					)}
				</tbody>
			</table>
			<script dangerouslySetInnerHTML={{ __html: "var adapterKey = '" + this.instance.key + "';" }}></script>
		</div>
		)
	}
}

class TreeItem extends React.Component {

	render() {
		var classes = "depth" + this.props.item.depth;

		var x = <span className="empty-dropper"></span>;
		var y = <div></div>;
		var z = <div></div>;
		var edit1 = <a data-type='copy' className='btn-flat dropdown-trigger' data-target={'dropdown_' + this.props.item.id}><i className="material-icons">content_copy</i></a>
		var edit2 = <ul id={'dropdown_' + this.props.item.id} className='dropdown-content'>
			<li><a data-copy="id" href="javascript:void(0);">ID</a></li>
			<li><a data-copy="val" href="javascript:void(0);">Wert</a></li>
		</ul>

		if (this.props.item.displaytype != "state") {
			x = <i className="material-icons dropper left">arrow_drop_down</i>;
			classes = classes + " grey lighten-" + this.props.item.depth;
			edit1 = "";
			edit2 = "";
		} else {
			var val = this.props.item.value;

			this.props.item.unit = converter.units[this.props.item.role];
			var classes2 = this.props.item.ack ? "" : "noack";
			if (this.props.item.unit == undefined)
				classes2 = classes2 + " nounit";

			switch (this.props.item.type) {
				case "button":
					edit1 = "";
					edit2 = "";
					y = <div data-type="state-command"><button className="btn grey">Auslösen</button></div>
					break;

				case "string":
					y = <div data-type="state-viewer"><span className={classes2 + " tooltipped"} data-tooltip={val} data-type="value">{val}</span><span data-type="unit">{this.props.item.unit}</span></div>;
					break;

				case "image":
					y = <div data-type="state-viewer"><span className={classes2} data-type="value"><a target="_blank" href={val}>Bild öffnen</a></span><span data-type="unit">{this.props.item.unit}</span></div>;
					break;

				case "object":
				case "array":
					val = JSON.stringify(val);
					y = <div data-type="state-viewer"><span className={classes2} data-type="value">{val}</span><span data-type="unit">{this.props.item.unit}</span></div>;
					break;

				case "boolean":
					val = val ? "true" : "false";
					y = <div data-type="state-viewer"><span className={classes2} data-type="value">{val}</span><span data-type="unit">{this.props.item.unit}</span></div>;
					break;

				default:
					y = <div data-type="state-viewer"><span className={classes2} data-type="value">{val}</span><span data-type="unit">{this.props.item.unit}</span></div>;
					break;
			}

			switch (this.props.item.type) {
				case "array":
				case "object":
					val = JSON.stringify(this.props.item.value, null, 4);
					z = <div data-type="state-editor"><input data-type="input" type="text" defaultValue={val} /></div>
					break;

				case "boolean":
					val = val ? "true" : "false";
					z = <div data-type="state-editor"><label><input data-type="input" type="checkbox" defaultChecked={this.props.item.value} /><span>&nbsp;</span></label></div>
					break;


				case "number":
					z = <div data-type="state-editor"><input data-type="input" type="number" defaultValue={this.props.item.value} /></div>
					break;

				case "text":
				default:
					if (this.props.item.states) {
						val = this.props.item.states[val];
						z = <div data-type="state-editor"><select data-type="input" type="text" defaultValue={this.props.item.value}>{Object.keys(this.props.item.states).map((item) => <SelectOption key={item} item={item} val={this.props.item.states[item]} />)}</select></div>
					} else {
						z = <div data-type="state-editor"><input data-type="input" type="text" defaultValue={this.props.item.value} /></div>
					}
					break;
			}

			if (this.props.item.read == false) {
				edit1 = "";
				edit2 = "";
			}
		}


		var style = {};
		var collapsed = "true";
		if (this.props.item.depth != 1) {
			style = { display: "none" };
			collapsed = "false";
		}



		return (
			<tr className={classes} data-type={this.props.item.displaytype} data-depth={this.props.item.depth} data-collapsed={collapsed} style={style}>
				<td>{x}<i className="material-icons left">{this.props.item.icon}</i>&nbsp;{this.props.item.shortId}</td>
				<td>{this.props.item.name}</td><td data-readonly={this.props.item.write == false ? "true" : "false"} data-type={this.props.item.type} data-key={this.props.item.key}>{y}{z}</td>
				<td data-type="actions">
					<div>
						<a data-type='edit' className='btn-flat red-text'>Löschen</a>
						{edit1}{edit2}
					</div>
				</td></tr>
		)
	}
}


class SelectOption extends React.Component {
	render() {
		return <option value={this.props.item}>{this.props.val}</option>;
	}
}

module.exports = Index;