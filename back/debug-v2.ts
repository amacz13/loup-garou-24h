import {chooseCupidonLovers, doDayVote, doNightVote, PlayerV2} from "./game-engine-v2.js";

const playersTest: PlayerV2[] = [
    {
        name: "Léa",
        role: 'Villageois',
        personality: "Brave, Expressive",
        isReal: false
    },{
        name: "Pierre",
        role: 'Loup Garou',
        personality: "Courageux, Audacieux",
        isReal: false
    },{
        name: "Marie",
        role: 'Loup Garou',
        personality: "Timide, Prudente",
        isReal: false
    },{
        name: "Martine",
        role: 'Villageois',
        personality: "Maline, Stratège",
        isReal: false
    },{
        name: "Paul",
        role: 'Villageois',
        personality: "Idiot, Drôle",
        isReal: false
    },{
        name: "Rémi",
        role: 'Voyante',
        personality: "Idiot, Drôle",
        isReal: false
    },{
        name: "Jade",
        role: 'Villageois',
        personality: "Souriante, Dynamique",
        isReal: false
    }
];

function getRandomPlayer(selectedPlayerNameList: string[]) {
    return selectedPlayerNameList[Math.floor(Math.random()*selectedPlayerNameList.length)];
}

async function doGameV2(playerList: PlayerV2[]) {
    console.log("Début de partie")
    let players: PlayerV2[] = [...playerList];
    do {
        const nightResult = await doNightVote(players);
        const eliminatedPlayerDuringNight = nightResult.selectedPlayerNameList.length > 1 ? getRandomPlayer(nightResult.selectedPlayerNameList) : nightResult.selectedPlayerNameList[0];
        players = players.filter(p => p.name.toLowerCase() !== eliminatedPlayerDuringNight);
        console.log(`Voici les joueurs encore en vie : ${players.map(p => p.name).join(',')}`);
        if (players.filter(p => p.role === 'Villageois').length > 0) {
            const dayResult = await doDayVote(players);
            const eliminatedPlayerDuringDay = dayResult.selectedPlayerNameList.length > 1 ? getRandomPlayer(dayResult.selectedPlayerNameList) : dayResult.selectedPlayerNameList[0];
            players = players.filter(p => p.name.toLowerCase() !== eliminatedPlayerDuringDay);
            console.log(`Voici les joueurs encore en vie : ${players.map(p => p.name).join(',')}`);
            console.log(`Il reste ${players.filter(p => p.role === 'Loup Garou').length} loups & ${players.filter(p => p.role === 'Villageois').length} villageois`);
        }
    } while (players.filter(p => p.role === 'Loup Garou').length > 0 && players.filter(p => p.role === 'Villageois').length > 0);
    console.log("Fin de partie")
}

//await doGameV2(playersTest);

//doDayVote(playersTest).then(result => console.log('Résultat du vote de jour : ', result));
//doNightVote(playersTest).then(result => console.log('Résultat du vote de nuit : ', result));

chooseCupidonLovers(playersTest).then(r => console.log("Result : ",r))