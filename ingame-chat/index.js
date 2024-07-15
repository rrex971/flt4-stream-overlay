let socket = new ReconnectingWebSocket("ws://127.0.0.1:24050/ws");
console.log("WebSocket connection attempt initiated");
socket.onopen = () => {
    console.log("Successfully Connected");
};
socket.onclose = event => {
    console.log("Socket Closed Connection: ", event);
    try {
        socket.send("Client Closed!");
    } catch (e) {
        console.log("Error sending message on close: ", e);
    }
};
socket.onerror = error => {
    console.log("Socket Error: ", error);
};
socket.onmessage = event => {
    console.log("Message received");
    try {
        let data = JSON.parse(event.data);
        let chatArr = data.tourney.manager.chat;
        displayChatMessages(chatArr);
    } catch (e) {
        console.log("Error processing message: ", e);
    }
};


let lastChat = '';

function displayChatMessages(chatArr) {
    let chatDiv = document.getElementById('chat');
    let messagesToShow = chatArr.slice(-10);
    while (chatDiv.firstChild) {
        chatDiv.removeChild(chatDiv.firstChild);
    }
    messagesToShow.forEach((msg, index) => {

        let msgContainer = document.createElement('div');
        msgContainer.classList.add('message');
        
        if (index === messagesToShow.length - 1 && msg.messageBody != lastChat) {
            msgContainer.classList.add('new-message');
            lastChat=msg.messageBody;
        }

        let nameDiv = document.createElement('div');
        nameDiv.classList.add('name');
        if(msg.team=="unknown"){
            nameDiv.classList.add('ref');
        }
        nameDiv.textContent = msg.name;
        let bodyDiv = document.createElement('div');

        bodyDiv.classList.add('body');
        bodyDiv.textContent = msg.messageBody;

        msgContainer.appendChild(nameDiv);
        msgContainer.appendChild(bodyDiv);
        chatDiv.appendChild(msgContainer);
        
        void msgContainer.offsetWidth;
    });
    chatDiv.scrollTop = chatDiv.scrollHeight;
}