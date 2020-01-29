var React = require('react');

class Index extends React.Component {
    constructor(props) {
        super(props);
        this.manager = require('../../../../manager/manage');
        this.instance = props.instance;
        this.adapter = props.adapter;

        if(this.instance.settings.pagebuttons == undefined)
            this.instance.settings.pagebuttons = [];

        this.adapter.settings.pageobjects.loglevel = {
            "title": "Log Level",
            "type": "select",
            "hint": "Log Level des Adapters",
            "value": "info",
            "options": {"error": "Fehler", "warn": "Warnung", "info": "Info", "debug": "Debug", "silly": "Verrückt"}
        };

        if(props.method == "post") {
            Object.keys(this.adapter.settings.pageobjects).map((key) => {
                var sett = this.adapter.settings.pageobjects[key];
                var value = null;

                switch(sett.type){
                    case "checkbox":
                        value = this.props.req.body[key] == "on";
                        break;
                    case "number":
                        value = parseInt(value = this.props.req.body[key]);
                        break;
                    case "text":
                    case "select":
                    default:
                        value = this.props.req.body[key];
                }
                this.instance.settings[key] = value;
            });
            this.manager.save("instances", this.instance);
        }

        if(this.adapter.settings.pagebuttons == undefined)
            this.adapter.settings.pagebuttons = [];
    }

  render() {
    return <form id="settings" method="POST" style={{width: '600px'}}>
        {Object.keys(this.adapter.settings.pageobjects).map((key, index) =>
            <FormInput item={this.adapter.settings.pageobjects[key]} value={this.instance.settings[key]} key={index} xkey={key} />
        )}

        <div className="row">
            <div className="col s4">&nbsp;</div>
            <div className="col s8">
                {this.adapter.settings.pagebuttons.map((item, index) => 
                    <FormButton key={index} item={item} />
                )}
            </div>
        </div>
        <div >
            
            <button className="btn success">Speichern</button>
        </div>
    </form>
  }
}


class FormInput extends React.Component {
    
    render() {
        var input = <div></div>;
        var label = <label>{this.props.item.title}</label>;
        
        switch(this.props.item.type) {
            case "text":
            default:
                if(this.props.item.unit)
                    input = <input id={this.props.xkey} name={this.props.xkey} type="text" defaultValue={this.props.value} placeholder={this.props.item.placeholder} data-role="input" data-append={this.props.item.unit} />
                else
                    input = <input id={this.props.xkey} name={this.props.xkey} type="text" defaultValue={this.props.value} placeholder={this.props.item.placeholder} />
                break;
            case "select":
                input = <div className="input-field"><select id={this.props.xkey} name={this.props.xkey} defaultValue={this.props.value}>
                    {Object.keys(this.props.item.options).map((option, index) => 
                        <FormOption value={option} title={this.props.item.options[option]} key={index} />
                    )}
                </select></div>
                break;
            case "tags":
                input = <input id={this.props.xkey} name={this.props.xkey} type="text" data-role="taginput" data-tag-trigger="32,188" defaultValue={this.props.value} placeholder={this.props.item.placeholder} />;
                break;
            case "checkbox":
                label = null;
                input = <label><input name={this.props.xkey} type="checkbox" defaultChecked={this.props.value} /><span>{this.props.item.title}</span></label>
                break;
        }

        let hint = <span></span>;

        if(this.props.item.hint != undefined) 
            hint = <div><span className="helper-text">{this.props.item.hint}</span></div>;

        let inputClass = "col s8";
        if(this.props.item.type != "checkbox") inputClass = inputClass + " input-field";

        return <div>
                <div className="row">
                    <div className="col s4">{label}</div>
                    <div className={inputClass}>{input}{hint}</div>
                </div>
            </div>
    }

}

class FormButton extends React.Component {
    render() {
        return <a id={this.props.item.id} className="btn blue darken-1">{this.props.item.title}</a>
    }
}

class FormOption extends React.Component {
    render() {
        return <option value={this.props.value}>{this.props.title}</option>
    }
}

module.exports = Index;