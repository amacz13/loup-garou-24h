import {fileURLToPath} from "url";
import path from "path";
import {getLlama, LlamaChatSession, LlamaLogLevel} from "node-llama-cpp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const startPrompt = '<|system|>\n' +
    '</s>\n' +
    '<|user|>'
const endPrompt = '</s>\n' +
    '<|assistant|>'

export interface Player {
    name: string;
    role: string;
    personality: string;
}

export async function doDayVote(playerList: Player[]): Promise<Player[]> {
    console.log("☀️ Le jour se lève !")
    const llama = await getLlama({logLevel: LlamaLogLevel.error});
    const votes = [];

    for (const player of players) {
        console.log(`-> C'est à ${player.name} de voter !`);
        const model = await llama.loadModel({
            modelPath: path.join(__dirname, "models", "zephyr-7b-beta.Q4_K_M.gguf")
        });
        const plContext = await model.createContext({batchSize: 0});
        const plSession = new LlamaChatSession({contextSequence: plContext.getSequence()});
        const playerPrompt = `Ton nom est ${player.name}, tu es un ${player.role} et les habitants du village meurent toutes les nuits à cause des loups-garous. Les autres joueurs sont ${ player.role === 'Loup Garou' ? players.filter(p => p.role !== 'Loup Garou' ).map(p => p.name).join(",") : players.filter(p => p.name !== player.name ).map(p => p.name).join(",")}. C'est à toi de voter, qui veux tu éliminer ? Réfléchis étape par étape. Réponds avec un JSON de la forme : { why: 'Créer une courte explication de ton choix en français', who: 'Nomme le joueur que tu souhaites éliminer ou None si tu ne souhaites pas voter'}. Réponds avec le JSON et rien d'autre avant ou après.`;
        const playerRes = await plSession.prompt(playerPrompt, {temperature: 0.4});
        console.log("playerRes",playerRes)
        const jsonRes = JSON.parse(playerRes.replace("<|assistant|>",""));
        votes.push(jsonRes.who);
        console.log(` <- Je vote contre ${jsonRes.who}, car ${jsonRes.why}`);
        await plContext.dispose();
        await model.dispose()
    }

    const voteMap = new Map();
    votes.forEach(vote => {
        if (voteMap.has(vote)) {
            voteMap.set(vote, voteMap.get(vote)+1);
        } else voteMap.set(vote, 1);
    });

    console.log("Voici les résultats des votes : ");
    const invertedVoteMap = new Map();
    let maxVote = 0;
    voteMap.forEach((value, key) => {
        console.log(`${key}: ${value} voix`);
        if (invertedVoteMap.has(value)) invertedVoteMap.set(value, [...invertedVoteMap.get(value), key]);
        else invertedVoteMap.set(value, [key]);
        if (value > maxVote || maxVote === 0) maxVote = value;
    });

    const tie = invertedVoteMap.get(maxVote).length > 1;
    if (tie) {
        console.log(`Il y a égalité entre ${invertedVoteMap.get(maxVote).join(' et ')} !`);
    } else {
        console.log(`${invertedVoteMap.get(maxVote)[0]} est éliminé !`)
    }
    return invertedVoteMap.get(maxVote);
}


export async function doNightVote(playerList: Player[]): Promise<Player[]> {
    console.log("🌙️ La nuit arrive !")
    const llama = await getLlama({logLevel: LlamaLogLevel.error});
    const votes = [];
    const wolves = playerList.filter(p => p.role === 'Loup Garou');
    const villagers = playerList.filter(p => p.role !== 'Loup Garou');

    for (const wolf of wolves) {
        const model = await llama.loadModel({
            modelPath: path.join(__dirname, "models", "zephyr-7b-beta.Q4_K_M.gguf")
        });
        const plContext = await model.createContext({batchSize: 0});
        const plSession = new LlamaChatSession({contextSequence: plContext.getSequence()});
        const playerPrompt = `Ton nom est ${wolf.name}, tu es un Loup Garou et les habitants du village meurent toutes les nuits à cause des loups-garous. C'est la nuit, et tu dois choisir d'éliminer un villageois parmi : ${villagers.map(p => p.name).join(",")}. Qui veux tu éliminer ? Réponds avec un JSON de la forme : { why: 'Créer une courte explication de ton choix en français', who: 'Nomme le joueur que tu souhaites éliminer ou None si tu ne souhaites pas voter' }. Réponds avec le JSON et rien d'autre avant ou après.`;
        const playerRes = await plSession.prompt(playerPrompt, {temperature: 0.15});
        console.log("playerRes",playerRes)
        const jsonRes = JSON.parse(playerRes.replace("<|assistant|>","").replace("<|user|>",""));
        votes.push(jsonRes.who);
        console.log(` <- Je souhaite dévorer ${jsonRes.who}`);
    }

    const voteMap = new Map();
    votes.forEach(vote => {
        if (voteMap.has(vote)) {
            voteMap.set(vote, voteMap.get(vote)+1);
        } else voteMap.set(vote, 1);
    });

    console.log("Voici les résultats des votes des loups : ");
    const invertedVoteMap = new Map();
    let maxVote = 0;
    voteMap.forEach((value, key) => {
        console.log(`${key}: ${value} voix`);
        if (invertedVoteMap.has(value)) invertedVoteMap.set(value, [...invertedVoteMap.get(value), key]);
        else invertedVoteMap.set(value, [key]);
        if (value > maxVote || maxVote === 0) maxVote = value;
    });

    const tie = invertedVoteMap.get(maxVote).length > 1;
    if (tie) {
        console.log(`Il y a égalité entre ${invertedVoteMap.get(maxVote).join(' et ')} !`);
    } else {
        console.log(`${invertedVoteMap.get(maxVote)[0]} est dévoré par les loups !`)
    }
    return invertedVoteMap.get(maxVote);
}

const players: Player[] = [
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
].map(value => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value);

//doDayVote(players);
doNightVote(players);