$("#select_id").click(() => {
    selectId.show("device", (name) => {
        $("#device_id").val(name);
    });
});