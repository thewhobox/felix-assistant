$("a[data-target=dialog-edit]").click((e) => {
    let ele = $(e.currentTarget).parent().parent();

    $("#dialog-edit input[name=name]").val($("td:nth-child(2)", ele).html());
    $("#dialog-edit input[name=siteId]").val($("td:nth-child(3)", ele).html());
    $("#dialog-edit input[name=id]").val(ele.data("id"));
    $("#dialog-edit input[name=device_id]").val(ele.data("temp"));
    $("#dialog-edit input[name=device_id2]").val(ele.data("tempsoll"));

    console.log(ele.data("id"))

});

$(".selectId .btn").click((e) => {
    selectId.show("state:role=level.temp", (name) => {
        let ele = $(e.currentTarget);
        console.log($("input", ele.parent()));
        $("input", ele.parent()).val(name);
        //$("#device_id").val(name);
    });
});