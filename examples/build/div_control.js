var isResizing = false;
let preclientX;
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
            $('#input').height('15%');
            $('#output').height('75%-8');
        }
        else {
            $('#input').fadeOut(0.1);
            $('.resizer2').fadeOut(0.1);
            $('#input').fadeOut(0.1);
            $('#output').height('100%');
        }
    });
});
