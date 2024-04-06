import {doDayVote, doNightVote, Player} from "./game-engine.js";

const playersTest: Player[] = [
    {
        name: "Léa",
        role: 'Villageois',
        personality: "Brave, Expressive",
    },{
        name: "Pierre",
        role: 'Loup Garou',
        personality: "Courageux, Audacieux",
    },{
        name: "Marie",
        role: 'Loup Garou',
        personality: "Timide, Prudente",
    },{
        name: "Martine",
        role: 'Villageois',
        personality: "Maline, Stratège",
    },{
        name: "Paul",
        role: 'Villageois',
        personality: "Idiot, Drôle",
    }
];

async function doGame(playerList: Player[]) {
    console.log("Début de partie")
    let players: Player[] = [...playerList];
    do {
        const nightResult = await doNightVote(players);
        players = players.filter(p => p.name.toLowerCase() !== nightResult.selectedPlayerNameList[0]);
        console.log(`Voici les joueurs encore en vie : ${players.map(p => p.name).join(',')}`);
        if (players.filter(p => p.role === 'Villageois').length > 0) {
            const dayResult = await doDayVote(players);
            players = players.filter(p => p.name.toLowerCase() !== dayResult.selectedPlayerNameList[0]);
            console.log(`Voici les joueurs encore en vie : ${players.map(p => p.name).join(',')}`);
            console.log(`Il reste ${players.filter(p => p.role === 'Loup Garou').length} loups & ${players.filter(p => p.role === 'Villageois').length} villageois`);
        }
    } while (players.filter(p => p.role === 'Loup Garou').length > 0 && players.filter(p => p.role === 'Villageois').length > 0);
    console.log("Fin de partie")
}

await doGame(playersTest);

//doDayVote(playersTest).then(result => console.log('Résultat du vote de jour : ', result));
//doNightVote(playersTest).then(result => console.log('Résultat du vote de nuit : ', result));