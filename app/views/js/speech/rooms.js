$("a[data-target=dialog-edit]").click((e) => {
    let ele = $(e.currentTarget).parent().parent();

    $("#dialog-edit input[name=name]").val($("td:nth-child(2)", ele).html());
    $("#dialog-edit input[name=siteId]").val($("td:nth-child(3)", ele).html());
    $("#dialog-edit input[name=id]").val(ele.data("id"));

    console.log(ele.data("id"))

});

$("#select_id").click(() => {
    selectId.show("state:role=temperatur", (name) => {
        $("#device_id").val(name);
    });
});