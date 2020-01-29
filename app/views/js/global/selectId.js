let selectId = {
    show: (type, callback, instance) => {
        selectId.type = type;
        selectId.callback = callback;
        if($("#selectId").length == 0) {
            $("body").append(`<div id="selectId" class="modal">
                <div class="modal-content">
                    <h4>Datenpunkt auswählen</h4>
                    <div class="input-field col s12">
                        <select></select>
                        <!--<label>Adapter Instanz</label>-->
                    </div>
                    <div>
                    <table class="table">
                    <thead>
                        <tr>
                            <th>Key</th>
                            <th>Name</th>
                            <th style="width: 200px">Wert</th>
                        </tr>
                    </thead>
                    <tbody>
                        
                    </tbody>
                </table>
                    </div>
                </div>
                <div class="modal-footer">
                    <a data-type="cancel" class="modal-close waves-effect waves-red btn-flat">Abbrechen</a>
                    <a data-type="select" class="modal-close waves-effect waves-green disabled btn-flat">Auswählen</a>
                </div>
            </div>`);
            M.Modal.init($("#selectId"));

            $("#selectId select").change(() => selectId.loadDatapoints());
            $("#selectId a[data-type=select]").click(() => selectId.callback(selectId.item));

            selectId.instance = M.Modal.getInstance($("#selectId"));
            selectId.item = "deconz.0.Light.14.on";

            console.log("hostname", window.location.protocol + "\/\/" + window.location.hostname + ":3000");
            selectId.conn = io(window.location.protocol + "\/\/" + window.location.hostname + ":3000");
            selectId.conn.on("connect", () => console.log("Verbunden..."));
            selectId.conn.on('error', (err) => console.log("Error", err));
            if(instance == undefined) {
                selectId.conn.emit("message", { to: "system.manager", cmd: "getInstances" }, selectId.loadInstances);
            } else {
                selectId.loadDatapoints(instance);
            }
        }
        selectId.conditions = {};

        if(selectId.type.indexOf(":") !== -1) {
            let temp = selectId.type.split(":");
            selectId.type = temp[0];
            temp = temp[1].split(";");
            for(let index in temp) {
                let splitted = temp[index].split("=");
                selectId.conditions[splitted[0]] = splitted[1];
            }
        }

        console.log(selectId.conditions);
        selectId.instance.open();
    },
    hide: () => {
        if(selectId.instance) {
            selectId.instance.close();
            $("#selectId table tbody").html("");
            $("#selectId select").html("");
        }
    },
    loadInstances: (instances) => {
        instances.forEach((item) => {
            $("#selectId select").append("<option>" + item + "</option>")
        });
        M.FormSelect.init($("#selectId select"));
        selectId.loadDatapoints();
    },
    loadDatapoints: (instance) => {
        if(instance == undefined) instance = $("#selectId select").val();
        selectId.conn.emit("message", { to: "system.manager", cmd: "getInstanceDPs", value: instance }, selectId.showDatapoints);
    },
    showDatapoints: (dps) => {
        $("#selectId table tbody").html("")
        console.log(dps)
        dps.forEach((dp) => {
            if(dp.type == "boolean") dp.value = dp.value ? "true":"false";
            $("#selectId table tbody").append("<tr class='depth" + dp.depth + "' data-data='" + JSON.stringify(dp) + "' data-type='" + dp.displaytype + "' data-depth='" + dp.depth + "' " + (dp.depth > 1 ? "style='display:none'":"") + " data-collapsed='true' data-key='" + dp.key + "'>"+
                "<td>" + (dp.displaytype !== "state" ? "<i class='material-icons dropper left mif-arrow-drop-up'>arrow_drop_down</i>":"") + "<i class='material-icons left'>" + dp.icon + "</i>" + dp.shortId + "</td>" +
                "<td>" + dp.name + "</td>" +
                "<td>" + (dp.value || "") + "</td>" +
                "</tr>")
        });
        
        $("#selectId .dropper").click(selectId.dropperClick);
        $("#selectId tr").click(selectId.checkSelect);
    },
    checkSelect: (ele) => {
        $("#selectId tbody tr").removeClass("selected");
        var row = $(ele.currentTarget);
        row.addClass("selected")
        

        if(row.data("type") == selectId.type && selectId.isOk(row.data("data"))) {
            row.addClass("selected");
            selectId.item = row.data("key");
            $("#selectId a[data-type=select]").removeClass("disabled");
            $("#selectId tbody tr").removeClass("fail");
        } else {
            if(row.data("type") == selectId.type) {
                $("#selectId tbody tr").removeClass("fail");
                row.addClass("fail");
            }
            row.removeClass("selected");
            $("#selectId a[data-type=select]").addClass("disabled");
        }
    },
    isOk: (data) => {
        let isOk = true;
        console.log(selectId.conditions);
        for(let condName in selectId.conditions) {
            console.log(condName + " " + selectId.conditions[condName] + " " + data[condName])
            if(data[condName] != selectId.conditions[condName])
                isOk = false;
        }
        return isOk;
    },
    dropperClick: (ele) => {
        {
            var row = $(ele.target).parent().parent();
            var list = $("tbody tr");
            var startDepth = row.data("depth");
            var index = list.index(row);
            var isCollapsed = row.attr("data-collapsed") == "true";
            var maxdepth = startDepth + 1;
            
            for(var i = index+1; i < list.length; i++) {
                var ele = $(list[i]);
                var depth = ele.data("depth");
                if(depth <= startDepth){
                    break;
                }
        
                if(isCollapsed){
                    if(depth > maxdepth) {
                        ele.css("display", "none");
                        ele.attr("data-collapsed", true);
                    } else {
                        ele.css("display", "table-row");
                        ele.attr("data-collapsed", true);
                    }
                } else {
                    ele.css("display", "none");
                    ele.attr("data-collapsed", !isCollapsed);
                }
            }
        
            row.attr("data-collapsed", !isCollapsed);
        
            var dropper = $(".dropper", row);
            if(isCollapsed){
                dropper.removeClass("mif-arrow-drop-down");
                dropper.addClass("mif-arrow-drop-up");
            } else {
                dropper.removeClass("mif-arrow-drop-up");
                dropper.addClass("mif-arrow-drop-down");
            }
        }
    }
}

