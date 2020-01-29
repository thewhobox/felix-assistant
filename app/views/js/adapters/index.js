var socket = io(window.location.protocol + "\/\/" + window.location.hostname +":3000");


socket.on('connect', () => {
    console.log("verbudnen....")
    socket.emit("subscribeMessage", "system.frontend");
});

socket.on('error', (err) => {
    console.log("Error", err);
});

socket.on("message", (data) => {
    switch(data.cmd) {
        case "adapterStateChanged":
            if(data.data.status) {
                $("tr[data-adapter='" + data.data.key + "'] a[data-action=start]").css({ "display": "none" });
                $("tr[data-adapter='" + data.data.key + "'] a[data-action=stop]").css({ "display": "inline-block" });
            } else {
                $("tr[data-adapter='" + data.data.key + "'] a[data-action=start]").css({ "display": "inline-block" });
                $("tr[data-adapter='" + data.data.key + "'] a[data-action=stop]").css({ "display": "none" });
                $("tr[data-adapter='" + data.data.key + "'] td[data-role=infoMem]").html("");
                $("tr[data-adapter='" + data.data.key + "'] td[data-role=infoCpu]").html("");
            }
            break;
    }
});

$("a[data-action=start]").click((e) => {
    var key = $(e.currentTarget).parent().parent().data("adapter");
    socket.emit("message", { to: "system.manager", cmd: "adapterStateChange", value: { start: true, key: key }});
})

$("a[data-action=stop]").click((e) => {
    var key = $(e.currentTarget).parent().parent().data("adapter");
    socket.emit("message", { to: "system.manager", cmd: "adapterStateChange", value: { start: false, key: key }});
})

updateAdapterInfo();

setInterval(() => {
    updateAdapterInfo();
}, 1000);

function updateAdapterInfo() {
    socket.emit("message", { to: "system.manager", cmd: "getAdapterInfo" }, (data) => {
        console.log(data)
        var totalmem = 0;
        for(let key  in data) {
            let obj = data[key];
            totalmem = totalmem + obj.mem;
            $("tr[data-adapter='" + key + "'] td[data-role=infoMem]").html(obj.mem + " MB");
            $("tr[data-adapter='" + key + "'] td[data-role=infoCpu]").html(obj.cpu + " %");
        }
        $("tr[data-adapter=total] td[data-role=infoMem]").html(Math.round(totalmem * 100) / 100 + " MB");
    });
}