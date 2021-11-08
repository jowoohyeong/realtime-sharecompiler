var isResizing = false;
let preclientX;
let frame = document.getElementsByClassName('main')[0];
let left = document.getElementsByClassName('codetext')[0];
let a=16;

$('.codetext').width(window.innerWidth - 450);
$('.resulttext').width(250);

(function () {
    let frame = document.getElementsByClassName('main')[0];
    let handle = document.getElementsByClassName('resizer')[0];
    handle.onmousedown = function (e) {
        isResizing = true;
    };
    document.onmousemove = function (e) {
        if (!isResizing) {
            return;
        }
        const right_width = window.innerWidth - e.clientX - 200 - 22; //커서좌측이동

        let left = e.clientX - frame.offsetLeft
        preclientX = e.clientX;
        if ((right_width > 0) && (left > 399)) {
            let rightwidth = frame.clientWidth - handle.clientWidth - left;
            $('.codetext').width(left);
            $('.resulttext').width(rightwidth);
        }
    }
    document.onmouseup = function (e) {
        isResizing = false;
    }
})();
$(document).ready(function () {
    $('#inputBox').change(function () {
        if (this.checked) {
            $('#input').fadeIn(0.1);
            $('.resizer2').fadeIn(0.1);

            $('#output').height('75%-8');
        }
        else {
            $('#input').fadeOut(0.1);
            $('.resizer2').fadeOut(0.1);

            $('#output').height('100%');
        }
    });
});
window.onresize = function (event) {
    var innerWidth = window.innerWidth - 180;
    $(".codetext").width(innerWidth - 272);

    if (window.innerWidth <= 900) {
        $(".codetext").width(500);
        $('.resulttext').width(245)
    }
}


function upfs() {
    document.getElementsByClassName('CodeMirror-sizer')[0].style.fontSize = (a+1)+'px';
    a +=1;
}
function downfs(){
    document.getElementsByClassName('CodeMirror-sizer')[0].style.fontSize = (a-1)+'px';
    a -=1;
}
