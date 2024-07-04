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

    getMin() {
        if (this.heap.length === 0) return null;

        let minPlayer = this.heap[0];
        for (let i = 1; i < this.heap.length; i++) {
            if (this.heap[i].score < minPlayer.score) {
                minPlayer = this.heap[i];
            }
        }
        return minPlayer;
    }
}

let socket = new ReconnectingWebSocket("ws://127.0.0.1:24050/ws");

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
let currentPlayerCount = 0;
let ready = false;

function initializeLeaderboard(players) {
    const leaderboardElement = document.getElementById('leaderboard');
    leaderboardElement.innerHTML = '';  

    leaderboard.heap = [];  
    players.forEach(player => {
        leaderboard.insert(player);
        const playerElement = document.createElement('li');
        const playerScoreElement = document.createElement('div');
        playerElement.className = 'player';
        playerScoreElement.className = 'score';
        playerElement.id = `player-${player.name}`;
        playerScoreElement.id = `player-${player.name}-score`;
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

function getMinPlayer() {
    return leaderboard.getMin();
}

socket.onmessage = (event) => {
    let data = JSON.parse(event.data);
    const scores = [];

    if (data.tourney && data.tourney.ipcClients) {
        for (let i = 0; i < 6; i++) {
            if (data.tourney.ipcClients[i]) {
                let name = data.tourney.ipcClients[i].gameplay.name;
                if (!name) continue; 

                let score = data.tourney.ipcClients[i].gameplay.score;
                if (data.tourney.ipcClients[i].gameplay.mods.str.includes('EZ')) {
                    score *= 1.75;
                }

                scores.push({ name: name, score: score });
            }
        }
    }

    if (!ready || scores.length !== currentPlayerCount) {
        initializeLeaderboard(scores);
        currentPlayerCount = scores.length;
        ready = true;
    } else {
        scores.forEach(player => {
            leaderboard.updateScore(player.name, player.score);
        });
        updateLeaderboard();
    }

    // Simulate end of map for demonstration
    onMapEnd();
};


function onMapEnd() {
    const lowestScoringPlayer = getMinPlayer();
    console.log("Lowest Scoring Player:", lowestScoringPlayer);
}
