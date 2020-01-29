$("#day, #adapter, #level").change(() => {
    $("#dayform").submit();
})

$("td").dblclick((e) => {
    var ele = e.target;
    var i = 0;

    while(ele.localName != "tr" && i < 10) {
        ele = $(ele).parent()[0];
        i++;
    }

    if($(ele).data("canexpand") == "false") return;
    
    if($("td:last-child div:last-child", ele).css("display") == "none") {
        $("td:last-child div:last-child", ele).show("slow");
        $("td:nth-child(4) span", ele).removeClass("mif-expand-more");
        $("td:nth-child(4) span", ele).addClass("mif-expand-less");
    } else {
        $("td:last-child div:last-child", ele).hide("slow")
        $("td:nth-child(4) span", ele).addClass("mif-expand-more");
        $("td:nth-child(4) span", ele).removeClass("mif-expand-less");
    }
});

$("tbody tr td:nth-child(4)").click((e) => {
    var ele = e.target;
    var i = 0;

    while(ele.localName != "tr" && i < 10) {
        ele = $(ele).parent()[0];
        i++;
    }

    if($(ele).data("canexpand") == "false") return;

    if($("td:last-child div:last-child", ele).css("display") == "none") {
        $("td:last-child div:last-child", ele).show("slow");
        $("td:nth-child(4) span", ele).removeClass("mif-expand-more");
        $("td:nth-child(4) span", ele).addClass("mif-expand-less");
    } else {
        $("td:last-child div:last-child", ele).hide("slow")
        $("td:nth-child(4) span", ele).addClass("mif-expand-more");
        $("td:nth-child(4) span", ele).removeClass("mif-expand-less");
    }
})