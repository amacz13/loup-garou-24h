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

//doDayVote(playersTest).then(result => console.log('Résultat du vote de jour : ', result));
doNightVote(playersTest).then(result => console.log('Résultat du vote de nuit : ', result));