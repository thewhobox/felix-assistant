var instanceKey = $("#instance").val();

$(".dropper").click((ele) => {
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
});

$("table a[data-copy=id]").click((e) => {
    var ele = $(e.currentTarget).parent().parent().parent().parent().parent();
    var key = $("td:nth-child(3)", ele).data("key");
    copyToClipboard(key);

    alert("ID wurde in Zwischenablage kopiert.")
});

$("table a[data-copy=val]").click((e) => {
    var ele = $(e.currentTarget).parent().parent().parent().parent().parent();
    var type = $("td:nth-child(3)", ele).data("type");
    var key = undefined;

    switch(type) {
        case "image":
            key = $("div[data-type=state-viewer] span[data-type=value] a", ele).prop("href");
            break;

        default:
            key = $("div[data-type=state-viewer] span[data-type=value]", ele).html();
            break;
    }


    copyToClipboard(key);

    alert("Wert wurde in Zwischenablage kopiert.")
});





let handledChange = false;

$("div[data-type=state-viewer]").dblclick((ele) => {
    handledChange = false;
    removeSelections();

    var parent;

    if(ele.target.localName == "span")
        parent = $(ele.target).parent().parent();
        
    if(ele.target.localName == "div")
        parent = $(ele.target).parent();


    if(parent.data("readonly")) {
        alert("Der Datenpunkt ist readonly", "grey");
        return;
    }

    parent.addClass("active");

});


$("div[data-type=state-command] button").click((e) => { handledChange = false; checkChangedState(e) });
$("div[data-type=state-editor] [data-type=input]").change((e) => { handledChange = false; checkChangedState(e) });
//$("div[data-type=state-editor] [data-type=input]").focusout((e) => { handledChange = false; checkChangedState(e) });

function checkChangedState(ele) {
    if(handledChange) return;
    handledChange = true;
    var ele = $(ele.target);

    var val = "";
    var td = ele.parent().parent();

    if(td[0].localName == "div") {
        td = td.parent();
    }

    td.removeClass("active");

    switch(td.data("type")) {
        case "direction":
            val = $(ele).data("value");
            break;
        case "button":
            val = true;
            break;
        case "boolean":
            val = ele.prop("checked") ? true : false;
            break;
        default:
            val = ele.val();
            break;
    }
    
    if(val === "") {
        alert("Ungüliger Wert eingegeben.", "red white-text");
        return;
    }

    var id = td.data("key");
    id = id.substr(id.replace(".", "-").indexOf(".")+1);

    socket.emit("message", { to: instanceKey, cmd: "setForeignState", value: { id: id, value: val }});
}


var socket = io(window.location.protocol + "\/\/" + window.location.hostname +":3000");

socket.on("connect", () => {
    console.log("Verbunden...");
    socket.emit("subscribe", adapterKey + ".*");
})

socket.on('error', (err) => {
    console.log("Error", err);
});


socket.on("stateChanged", stateChanged);

function stateChanged(data) {
    switch(data.type) {
        case "object":
            if(typeof data.value != "string")
                data.value = JSON.stringify(data.value);
            $("td[data-key='" + data.key + "'] div[data-type=state-editor] [data-type=input").val(data.value);
            break;
        case "boolean":
            $("td[data-key='" + data.key + "'] div[data-type=state-editor] [data-type=input]").prop("checked", data.value);
            data.value = data.value ? "true":"false";
            break;
        case "image":
            data.value = "<a target='_blank' href='" + data.value + "'>Bild öffnen</a>";
            break;
        default:
            $("td[data-key='" + data.key + "'] div[data-type=state-editor] [data-type=input").val(data.value);
            break;
    }
    
    var stateviewer = $("td[data-key='" + data.key + "'] div[data-type=state-viewer] span[data-type=value]");
    var val = data.value;

    if(data.hasOwnProperty("states")) {
        val = data.states[data.value];
    }
    
    stateviewer.html(val);

    if(data.ack)
        stateviewer.removeClass("noack");
    else
        stateviewer.addClass("noack");
}

function copyToClipboard(text) {
    if (window.clipboardData) { // Internet Explorer
        window.clipboardData.setData("Text", text);
    } else {  
        navigator.clipboard.writeText(text);
    }
}