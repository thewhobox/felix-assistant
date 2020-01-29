$(document).ready(() => {
    alert = function(text, classes = "") {
        //Metro.notify.create(text, title, options);
        M.toast({html: text, classes})
    }
    //M.AutoInit();
    $('select').formSelect();
    $('.modal').modal();
    $('.sidenav').sidenav();
    $('.tabs').tabs();
    $('.tooltipped').tooltip({ enterDelay: 1000 });
    $('.dropdown-trigger').dropdown();
    $('.fixed-action-btn').floatingActionButton();
});

function removeSelections() {
    if (window.getSelection) {
        if (window.getSelection().empty) {  // Chrome
            window.getSelection().empty();
        } else if (window.getSelection().removeAllRanges) {  // Firefox
            window.getSelection().removeAllRanges();
        }
    } else if (document.selection) {  // IE?
    document.selection.empty();
    }
}

$(".selectId input").on('keydown paste', function(e){
    e.preventDefault();
});