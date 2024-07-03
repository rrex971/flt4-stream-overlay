class PriorityQueue {
    constructor() {
        this.heap = [];
    }

    insert(player) {
        this.heap.push(player);
        this.heapifyUp(this.heap.length - 1);
    }

    updateScore(playerName, newScore) {
        for (let i = 0; i < this.heap.length; i++) {
            if (this.heap[i].name === playerName) {
                this.heap[i].score = newScore;
                this.heapifyUp(i);
                this.heapifyDown(i);
                break;
            }
        }
    }

    heapifyUp(index) {
        let currentIndex = index;

        while (currentIndex > 0) {
            const parentIndex = Math.floor((currentIndex - 1) / 2);

            if (this.heap[currentIndex].score <= this.heap[parentIndex].score) break;

            [this.heap[currentIndex], this.heap[parentIndex]] = [this.heap[parentIndex], this.heap[currentIndex]];
            currentIndex = parentIndex;
        }
    }

    heapifyDown(index) {
        let currentIndex = index;

        while (true) {
            const leftChildIndex = 2 * currentIndex + 1;
            const rightChildIndex = 2 * currentIndex + 2;
            let largestIndex = currentIndex;

            if (leftChildIndex < this.heap.length && this.heap[leftChildIndex].score > this.heap[largestIndex].score) {
                largestIndex = leftChildIndex;
            }

            if (rightChildIndex < this.heap.length && this.heap[rightChildIndex].score > this.heap[largestIndex].score) {
                largestIndex = rightChildIndex;
            }

            if (largestIndex === currentIndex) break;

            [this.heap[currentIndex], this.heap[largestIndex]] = [this.heap[largestIndex], this.heap[currentIndex]];
            currentIndex = largestIndex;
        }
    }

    toArray() {
        return [...this.heap].sort((a, b) => b.score - a.score);
    }
}

let socket = new ReconnectingWebSocket("ws://127.0.0.1:24050/websocket/v2");

socket.onopen = () => {
    console.log("api v2 connected");
};
socket.onclose = (event) => {
    console.log("Socket Closed Connection: ", event);
    socket.send("Client Closed!");
};
socket.onerror = (error) => {
    console.log("Socket Error: ", error);
};


const leaderboard = new PriorityQueue();
const playerElements = {};
const playerScoreElements = {};

function initializeLeaderboard(players) {
    const leaderboardElement = document.getElementById('leaderboard');
    players.forEach(player => {
        leaderboard.insert(player);
        const playerElement = document.createElement('li');
        const playerScoreElement= document.createElement('div');
        playerElement.className = 'player';
        playerScoreElement.className= 'score';
        playerElement.id = `player-${player.name}`;
        playerScoreElement.id= `player-${player.name}-score`;
        playerElement.textContent = `${player.name}`;
        playerScoreElement.textContent = `${player.score}`;
        leaderboardElement.appendChild(playerElement);
        playerElement.appendChild(playerScoreElement);
        playerElements[player.name] = playerElement;
        playerScoreElements[player.name] = playerScoreElement;
    });
}

function updateLeaderboard() {
    const sortedPlayers = leaderboard.toArray();
    const leaderboardElement = document.getElementById('leaderboard');

    sortedPlayers.forEach(player => {
        const playerElement = playerElements[player.name];
        const playerScoreElement = playerScoreElements[player.name];
        playerElement.textContent = `${player.name}`;
        playerScoreElement.textContent = `${player.score}`;
        leaderboardElement.appendChild(playerElement);
        playerElement.appendChild(playerScoreElement);
    });
}

function simulateScoreUpdates() {
    const players = Object.keys(playerElements).map(name => ({
        name,
        score: Math.floor(Math.random() * 1000),
    }));

    players.forEach(player => {
        leaderboard.updateScore(player.name, player.score);
    });

    updateLeaderboard();
}

/*const players = [
    { name: 'Player 1', score: 0 },
    { name: 'Player 2', score: 0 },
    { name: 'Player 3', score: 0 },
    { name: 'Player 4', score: 0 },
    { name: 'Player 5', score: 0 }
];
initializeLeaderboard(players);
*/
/*setInterval(simulateScoreUpdates, 100);*/
let ready=0;

socket.onmessage = (event) => {
    let data = JSON.parse(event.data);
    if(!ready){
        const players = [];
        let a = 0;
        for(let client in data.tourney.ipcClients){
            players.push({name: client.gameplay.name, score: client.gameplay.score, id: a});
            a++;
        }
        initializeLeaderboard(players1);
        ready=1;
    }
    else{

        // TODO: i have no clue how to update the score for each ipcClient
        /*
        const players = Object.keys(playerElements).map(name => ({
            name,
            score: `data.tourney.ipcClients.${players}`,
        }));
        */ 
    };
}
