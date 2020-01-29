$("input[name=search]").keyup(() => {
    let searchterm = $("input[name=search]").val();

    $("#adapterList div.card").each((index) => {
        item = $($("#adapterList div.card")[index]);
        if(item.data("keys").indexOf(searchterm) != -1) {
            item.show();
        } else {
            item.hide();
        }
    });
})