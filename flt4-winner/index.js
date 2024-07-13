let socket = new ReconnectingWebSocket("ws://127.0.0.1:24050/ws");

socket.onopen = () => {
    console.log("API connected");
};
socket.onclose = (event) => {
    console.log("Socket Closed Connection: ", event);
    socket.send("Client Closed!");
};
socket.onerror = (error) => {
    console.log("Socket Error: ", error);
};

socket.onmessage = (event) => {
    let data = JSON.parse(event.data);
    let currentStars = data.tourney.manager.stars.right + data.tourney.manager.stars.left;
    let clients = data.tourney.ipcClients

    function getStoredMapState() {
        return JSON.parse(localStorage.getItem('mapState')) || { stars: null, mapEnded: false };
    }

    function setStoredMapState(stars, mapEnded) {
        localStorage.setItem('mapState', JSON.stringify({ stars, mapEnded }));
    }

    const storedMapState = getStoredMapState();

    console.log("Current Stars: ", currentStars);

    let mapOngoing = (storedMapState.stars === currentStars);
    console.log("Map Status:", mapOngoing ? "Map Ongoing" : "Map Ended");

    if (!mapOngoing) {
        if (!storedMapState.mapEnded) {
            setStoredMapState(currentStars, true);
            if(getLength(clients) == 1){
                let topScoreClient = clients[0];

                let winner = topScoreClient.spectating.name;
                let winnerID = topScoreClient.spectating.userID;
                
                let pfpElement = document.getElementById("pfp");
                pfpElement.setAttribute('src',`https://a.ppy.sh/${winnerID}`)
                document.getElementById("winner").innerHTML=`${winner}`
            }else if(getLength(clients) == 2){
                let topScoreClient = clients[0].gameplay.score > clients[1].gameplay.score?clients[0]:clients[1];
                let winner = topScoreClient.spectating.name;
                let winnerID = topScoreClient.spectating.userID;
                
                let pfpElement = document.getElementById("pfp");
                pfpElement.setAttribute('src',`https://a.ppy.sh/${winnerID}`)
                document.getElementById("winner").innerHTML=`${winner}`
            }
        }
    } else {
        setStoredMapState(currentStars, false);
    }
};

function getLength(clients){
    let count = 0;
    for(i= 0; i < clients.length; i++){
        if(clients[i].spectating.name != ""){
            count += 1;
        }
    }
    return count;
}