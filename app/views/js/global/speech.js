$("[name=device]").change(() => {
    reloadColorCB();
});

function reloadColorCB() {
    var id = $("[name=device]").val();
    var color = $("[name=device] option[value='" + id + "']").data("color");
    
    $("[name=color]").prop("checked", color ? true:false)
    $("[name=color]").prop("disabled", !color)
}

reloadColorCB();

$(".selectId div.btn").click(() => {
    selectId.show("device", (name) => {
        $("#device_id").val(name);
    }, $("#instance").val());
});