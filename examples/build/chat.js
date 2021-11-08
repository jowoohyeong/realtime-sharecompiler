var user_id = $('#user_id').text();
document.querySelector('#list_refresh').addEventListener('click', function () {
    sendAjax(user_id, 'main');
});
(function () {
    const chatLog = document.querySelector('.log');
    const input_msg = document.querySelector('#input_msg');
    const ul_list = $('.ul_list');

    let ws;

    function init() {
        if (ws) {
            ws.onerror = ws.onopen = ws.onclose = null;
            ws.close();
        }
        ws = new WebSocket('ws://localhost:7007');
        ws.onopen = () => {
            const data = createdata("ENTER", user_id, `${user_id}님이 입장하셨습니다`);
            ws.send(JSON.stringify(data));
            document.getElementById("list_refresh").click()
        }
        ws.onmessage = data => {
            let data2 = JSON.parse(data.data);
            if (data2.content === "ENTER") Notice(data2.message);
            else if (data2.content === "OUT") Notice(data2.message);
            else if (data2.senderName !== user_id) sendMessage("left", data2.senderName, data2.message)
            else sendMessage("right", data2.senderName, data2.message);
        }
        ws.onclose = () => { }
    }
    $('#input_msg').keydown(function (e) {
        if (e.keyCode === 13) {
            if (!ws) return;
            const data = createdata("message", user_id, input_msg.value);
            ws.send(JSON.stringify(data));
        }
    });
    function createdata(content, name, msg) {
        return data = {
            "content": content,
            "senderName": name,
            "message": msg
        }
    }
    function Notice(message) {
        ul_list.append("<li>" + message + "</li>")
        ul_list.scrollTop = chatLog.scrollHeight;
        document.getElementById("list_refresh").click()
    }
    function createMessageTag(LR, senderName, message) {
        let chatLi = $('.chat_format ul li').clone();
        chatLi.addClass(LR);
        chatLi.find('.sender span').text(senderName);
        chatLi.find('.message span').text(message);
        return chatLi;
    }
    function sendMessage(LR, name, message) {
        const chatLi = createMessageTag(LR, name, message);
        $('.ul_list').append(chatLi);
        $('#input_msg').val('');
        $('div.log').scrollTop($('div.log').prop('scrollHeight'));
    }
    init();
})();