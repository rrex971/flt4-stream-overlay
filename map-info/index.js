const HOST = '127.0.0.1:24050';
const socket = new ReconnectingWebSocket(`ws://${HOST}/ws`);
let mapid = document.getElementById('mapid');

let bg = document.getElementById("bg");
let title = document.getElementById("title");
let mapper = document.getElementById("mapper");
let difficulty = document.getElementById("difficulty");
let cs = document.getElementById("cs");
let ar = document.getElementById("ar");
let od = document.getElementById("od");
let hp = document.getElementById("hp");
let bpm = document.getElementById("bpm");
let sr = document.getElementById("sr");
let mods = document.getElementById("mods");
const modsImgs = {
    'nm': './static/nomod.png',
    'hr': './static/hardrock.png',
    'dt': './static/doubletime.png',
    'hd': './static/hidden.png'
}

socket.onopen = () => {
    console.log("Successfully Connected");
};

socket.onclose = event => {
    console.log("Socket Closed Connection: ", event);
    socket.send("Client Closed!")
};

socket.onerror = error => {
    console.log("Socket Error: ", error);
};
let tempImg;
let tempCs;
let tempAr;
let tempOd;
let tempHp;
let tempBPM;
let tempSR;
let tempTitle;
let tempMapper;
let tempDifficulty;
let tempMods;

socket.onmessage = event => {
    let data = JSON.parse(event.data);
    if (data.menu.mods.str == "") {
        data.menu.mods.str = "NM";
    }
    if (tempImg !== data.menu.bm.path.full) {
        tempImg = data.menu.bm.path.full
        data.menu.bm.path.full = data.menu.bm.path.full.replace(/#/g, '%23').replace(/%/g, '%25')
        bg.setAttribute('src', `http://${HOST}/Songs/${data.menu.bm.path.full}?a=${Math.random(10000)}`)
    }
    
    if (tempTitle !== data.menu.bm.metadata.artist + ' - ' + data.menu.bm.metadata.title) {
        tempTitle = data.menu.bm.metadata.artist + ' - ' + data.menu.bm.metadata.title;
        title.innerHTML = tempTitle
    }
    if (data.menu.bm.metadata.mapper !== tempMapper) {
        tempMapper = data.menu.bm.metadata.mapper
        mapper.innerHTML = `Mapper: ${tempMapper} `
    }
    if (data.menu.bm.metadata.difficulty !== tempDifficulty) {
        tempDifficulty = data.menu.bm.metadata.difficulty
        difficulty.innerHTML = `Difficulty: ${tempDifficulty} `
    }

    if (data.menu.bm.stats.CS != tempCs) {
        tempCs = data.menu.bm.stats.CS
        cs.innerHTML = `CS: ${Math.round(tempCs * 10) / 10} <hr>`
    }
    if (data.menu.bm.stats.AR != tempAr) {
        tempAr = data.menu.bm.stats.AR
        ar.innerHTML = `AR: ${Math.round(tempAr * 10) / 10} <hr>`
    }
    if (data.menu.bm.stats.OD != tempOd) {
        tempOd = data.menu.bm.stats.OD
        od.innerHTML = `OD: ${Math.round(tempOd * 10) / 10} <hr>`
    }
    if (data.menu.bm.stats.HP != tempHp) {
        tempHp = data.menu.bm.stats.HP
        hp.innerHTML = `HP: ${Math.round(tempHp * 10) / 10} <hr>`
    }
    if (data.menu.bm.stats.BPM.common != tempBPM) {
        tempBPM = data.menu.bm.stats.BPM.common
        bpm.innerHTML = `BPM: ${Math.round(tempBPM * 10) / 10} <hr>`
    }
    if (data.menu.bm.stats.fullSR != tempSR) {
        tempSR = data.menu.bm.stats.fullSR
        sr.innerHTML = `SR: ${Math.round(tempSR * 10) / 10}* <hr>`
    }
    if (tempMods != data.menu.mods.str) {
        tempMods = data.menu.mods.str
        mods.innerHTML = '';
        let modsApplied = tempMods.toLowerCase();
        console.log(modsApplied);
        if (modsApplied.indexOf('nc') != -1) {
            modsApplied = modsApplied.replace('dt', '')
        }
        if (modsApplied.indexOf('pf') != -1) {
            modsApplied = modsApplied.replace('sd', '')
        }
        let modsArr = modsApplied.match(/.{1,2}/g);
        for (let i = 0; i < modsArr.length; i++) {
            if(["nm", "hr", "dt", "hd"].includes(modsArr[i])){
                let mod = document.createElement('div');
                mod.setAttribute('class', 'mod');
                let modImg = document.createElement('img');
                modImg.setAttribute('src', modsImgs[modsArr[i]]);
                mod.appendChild(modImg);
                mods.appendChild(mod);
            }
        }
    }
}
