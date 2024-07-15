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
    console.log("API connected");
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
const playerHeartStatus = {}; 
let currentPlayerCount = 0;
let ready = false;

function saveHeartStatus(playerName, heartStatus) {
    localStorage.setItem(`hearts-${playerName}`, JSON.stringify(heartStatus));
}

function loadHeartStatus(playerName) {
    const heartStatus = localStorage.getItem(`hearts-${playerName}`);
    return heartStatus ? JSON.parse(heartStatus) : [true, true];
}

function initializeLeaderboard(players) {
    const leaderboardElement = document.getElementById('leaderboard');
    leaderboardElement.innerHTML = '';  

    leaderboard.heap = [];  
    players.forEach(player => {
        leaderboard.insert(player);
        const playerElement = document.createElement('li');
        playerElement.className = 'player';
        playerElement.id = `player-${player.name}`;

        const playerImgElement = document.createElement('img');
        playerImgElement.src = `https://a.ppy.sh/${player.userId}`; 
        playerImgElement.alt = `${player.name}'s profile picture`;

        const playerNameElement = document.createElement('span');
        playerNameElement.textContent = `${player.name}`;
        
        const playerScoreElement = document.createElement('div');
        playerScoreElement.className = 'score';
        playerScoreElement.id = `player-${player.name}-score`;
        playerScoreElement.textContent = `${player.score}`;
        const playerScoreCount = new CountUp(`player-${player.name}-score`, 0, 0, 0, .3, { useEasing: true, useGrouping: true, separator: ',', decimal: '.', suffix: '' })

        
        const heartsContainer = document.createElement('div');
        heartsContainer.className = 'hearts-container';
        const heartStatus = loadHeartStatus(player.name); 
        playerHeartStatus[player.name] = heartStatus;

        for (let i = 0; i < 2; i++) {
            const heart = document.createElement('span');
            heart.className = heartStatus[i] ? 'heart enabled' : 'heart disabled'; 
            heart.innerHTML = '❤';
            heart.addEventListener('click', () => {
                heartStatus[i] = !heartStatus[i]; 
                heart.classList.toggle('enabled');
                heart.classList.toggle('disabled');
                saveHeartStatus(player.name, heartStatus); 
            });
            heartsContainer.appendChild(heart);
        }

        playerElement.appendChild(playerImgElement);
        playerElement.appendChild(playerNameElement);
        playerNameElement.appendChild(playerScoreElement);
        playerNameElement.appendChild(heartsContainer); 
        leaderboardElement.appendChild(playerElement);

        playerElements[player.name] = playerElement;
        playerScoreElements[player.name] = playerScoreCount;
    });
}

function updateLeaderboard() {
    const sortedPlayers = leaderboard.toArray();
    const leaderboardElement = document.getElementById('leaderboard');

    sortedPlayers.forEach(player => {
        const playerElement = playerElements[player.name];
        const playerScoreElement = playerScoreElements[player.name];
        playerScoreElement.update(player.score);
        leaderboardElement.appendChild(playerElement);
    });
}

function getMinPlayer() {
    return leaderboard.getMin();
}

function reduceHeart(playerName) {
    const heartStatus = loadHeartStatus(playerName);
    for (let i = heartStatus.length - 1; i >= 0; i--) { 
        if (heartStatus[i]) {
            heartStatus[i] = false;
            saveHeartStatus(playerName, heartStatus);

            const heartsContainer = playerElements[playerName].querySelector('.hearts-container');
            const heartElements = heartsContainer.querySelectorAll('.heart');
            heartElements[i].classList.remove('enabled');
            heartElements[i].classList.add('disabled');
            break;
        }
    }
}

function getStoredMapState() {
    return JSON.parse(localStorage.getItem('mapState')) || { stars: null, mapEnded: false };
}

function setStoredMapState(stars, mapEnded) {
    localStorage.setItem('mapState', JSON.stringify({ stars, mapEnded }));
}

socket.onmessage = (event) => {
    let data = JSON.parse(event.data);
    const scores = [];
    let currentStars = data.tourney.manager.stars.right + data.tourney.manager.stars.left;
    const storedMapState = getStoredMapState();

    console.log("Stars: ", currentStars);

    if (data.tourney && data.tourney.ipcClients) {
        for (let i = 0; i < 8; i++) {
            if (data.tourney.ipcClients[i]) {
                let name = data.tourney.ipcClients[i].gameplay.name;
                let userId = data.tourney.ipcClients[i].spectating.userID;
                if (!name) continue;

                let score = data.tourney.ipcClients[i].gameplay.score;
                if (data.tourney.ipcClients[i].gameplay.mods.str.includes('EZ')) {
                    score *= 1.75;
                }
                scores.push({ name: name, score: score, userId: userId });
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

    let mapOngoing = (storedMapState.stars === currentStars);
    console.log("Map Status:", mapOngoing ? "Map Ongoing" : "Map Ended");

    if (!mapOngoing) {
        if (!storedMapState.mapEnded) {
            setStoredMapState(currentStars, true);
            onMapEnd();
        }
    } else {
        setStoredMapState(currentStars, false);
    }
};

function onMapEnd() {
    const lowestScoringPlayer = getMinPlayer();
    console.log("Lowest Scoring Player:", lowestScoringPlayer);
    localStorage.setItem("Lowest Score", lowestScoringPlayer.name);
    reduceHeart(lowestScoringPlayer.name);
}
