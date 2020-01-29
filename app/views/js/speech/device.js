$("a[data-action=add]").click(() => {
    Metro.dialog.open('#dialog-add');
    $(".overlay").click(() => {
        Metro.dialog.close('#dialog-add');
    });

    return false;
});

$("[data-action=submit]").click(() => {
    $("#formadd").submit();
});

$("input[name=extern]").change(() => {
    checkExtern();
});

checkExtern();

function checkExtern() {
    if($("input[name=extern]").prop("checked")) {
        $("[data-showonextern=true").show();
        $("[data-hideonextern=true").hide();
    } else {
        $("[data-showonextern=true").hide();
        $("[data-hideonextern=true").show();
    }
}


$("[name=function]").change(checkDPs);
$("[name=filterrole]").change(checkDPs);

function checkDPs() {
    var dps = datapoints[$("[name=function]").val()];
    var filter = $("[name=filterrole]").prop("checked");
    var list = [];
    var foundsomething = false;

    dps.list.forEach((item) => {
        if(filter && item.role != dps.role) {

        } else {
            foundsomething = true;
            list.push('<option value="' + item.id + '">' + item.name + ' - ' + item.id + '</option>');
        }
    });

    if(dps.match != "") {
         $("[name=datapoint]").val(dps.match);
    }

    console.log(list);

    if(foundsomething) {
        $("[name=datapoint]").prop("disabled", false);
        $("[name=datapoint]").html(list.join(""));
        $("[name=datapoint]").formSelect();
        //$("[name=datapoint]").data("select").enable();
    } else {
        $("[name=datapoint]").prop("disabled", true);
        $("[name=datapoint]").html("<option>Keine passenden DP gefunden</option>");
        $("[name=datapoint]").formSelect();
    }

}


checkDPs();