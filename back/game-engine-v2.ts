import {fileURLToPath} from "url";
import path from "path";
import {getLlama, Llama, LlamaChatSession, LlamaLogLevel} from "node-llama-cpp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const startPrompt = '<|system|>\n' +
    '</s>\n' +
    '<|user|>';
const endPrompt = '</s>\n' +
    '<|assistant|>';
const llama = await getLlama({logLevel: LlamaLogLevel.error});

const engine = "zephyr-7b-beta.Q4_K_M.gguf";

export interface ResultV2 {
    selectedPlayerNameList: string[];
    reasons: PlayerReasonV2[]
}

export interface NightResultV2 extends ResultV2 {
    updatedPlayerList: PlayerV2[];
}

export interface PlayerReasonV2 {
    playerName: string;
    reason: string;
}

export interface BasicPlayerV2 {
    name: string;
    role: string;
    isReal: boolean;
    power?: string;
}

export interface Voyante {
    knownPlayerList: BasicPlayerV2[];
}

export interface PlayerV2 extends BasicPlayerV2 {
    personality: string;
    roleDetail?: Voyante;
}

function generateClairvoyantPrompt(player: PlayerV2) {
    return player.roleDetail?.knownPlayerList.map(p => `${p.name} est un ${p.role}`).join(', ');
}

function generateDayPrompt(player: PlayerV2, playerList: PlayerV2[], votesAsSet: Set<string>) {
    switch (player.role) {
        case "Loup Garou":
            return `Ton nom est ${player.name}, tu es un ${player.role} et les habitants du village meurent toutes les nuits à cause des loups-garous. Les autres joueurs sont ${playerList.filter(p => p.role !== 'Loup Garou' ).map(p => p.name).join(",")}. ${votesAsSet.size > 0 ? "Actuellement, les joueurs accusés sont " + [...votesAsSet].join(',')+". " : ""} C'est à toi de voter, qui veux tu éliminer ? Réfléchis étape par étape. Réponds avec un JSON de la forme : { why: 'Créer une courte explication drôle et fun de ton choix en français', who: 'Nomme le joueur que tu souhaites éliminer ou None si tu ne souhaites pas voter'}. Réponds avec le JSON et rien d'autre avant ou après.`;
        case "Voyante":
            return `Ton nom est ${player.name}, tu es un ${player.role} et les habitants du village meurent toutes les nuits à cause des loups-garous. Les autres joueurs sont ${playerList.filter(p => p.name !== player.name ).map(p => p.name).join(",")}. ${votesAsSet.size > 0 ? "Actuellement, les joueurs accusés sont " + [...votesAsSet].join(',')+". " : ""}. ${player.roleDetail?.knownPlayerList?.length && player.roleDetail?.knownPlayerList?.length > 0 ? 'Comme tu es la voyante, tu est certain que ' + generateClairvoyantPrompt(player) : ''} C'est à toi de voter, qui veux tu éliminer ? Réfléchis étape par étape. Réponds avec un JSON de la forme : { why: 'Créer une courte explication drôle et fun de ton choix en français', who: 'Nomme le joueur que tu souhaites éliminer ou None si tu ne souhaites pas voter'}. Réponds avec le JSON et rien d'autre avant ou après.`;
        default:
            return `Ton nom est ${player.name}, tu es un ${player.role} et les habitants du village meurent toutes les nuits à cause des loups-garous. Les autres joueurs sont ${playerList.filter(p => p.name !== player.name ).map(p => p.name).join(",")}. ${votesAsSet.size > 0 ? "Actuellement, les joueurs accusés sont " + [...votesAsSet].join(',')+". " : ""} C'est à toi de voter, qui veux tu éliminer ? Réfléchis étape par étape. Réponds avec un JSON de la forme : { why: 'Créer une courte explication drôle et fun de ton choix en français', who: 'Nomme le joueur que tu souhaites éliminer ou None si tu ne souhaites pas voter'}. Réponds avec le JSON et rien d'autre avant ou après.`;
    }
}

/**
 * doDayVote: Do a day round where all players vote to eliminate one of them
 * @param playerList The list of all remaining players
 * @param playerVote Optional, the vote of the real player
 */
export async function doDayVote(playerList: PlayerV2[], playerVote?: string): Promise<ResultV2> {
    playerList = randomizePlayerArray(playerList);
    console.log("☀️ Le jour se lève !");
    const votes = [];
    const votesAsSet = new Set<string>();
    if (playerVote) {
        votes.push(playerVote);
        votesAsSet.add(playerVote);
    }
    const result: ResultV2 = {
        selectedPlayerNameList: [],
        reasons: [],
    };

    for (const player of playerList.filter(p => !p.isReal)) {
        console.log(`-> C'est à ${player.name} de voter !`);
        let target = 'None';
        let reason = '';
        try {
            const model = await llama.loadModel({
                modelPath: path.join(__dirname, "models", engine)
            });
            const plContext = await model.createContext({batchSize: 0});
            const plSession = new LlamaChatSession({contextSequence: plContext.getSequence()});
            const playerPrompt = generateDayPrompt(player, playerList, votesAsSet);
            const playerRes = await plSession.prompt(playerPrompt, {temperature: 0.1});
            //console.log(" <- ",playerRes)
            try {
                const jsonRes = JSON.parse(playerRes.replace("<|assistant|>","").replace("<|user|>",""));
                target = jsonRes.who.toLowerCase().normalize("NFC");
                reason = jsonRes.why;
                votesAsSet.add(target);
            } catch {
                const curlyBracesInclusive = /\{([^}]+)\}/
                const arrRes = playerRes.replace("\n","").match(curlyBracesInclusive);
                if (arrRes) {
                    const jsonRes = JSON.parse(arrRes[0].replace("<|assistant|>","").replace("<|user|>",""));
                    target = jsonRes.who.toLowerCase().normalize("NFC");
                    reason = jsonRes.why;
                    votesAsSet.add(target);
                }
            }
            await plContext.dispose();
            await model.dispose()
        } catch (e) {
            console.error("Une erreur est survenue : ",e);
        }
        votes.push(target);
        result.reasons.push({playerName: player.name, reason});
        console.log(` <- Je vote contre ${target}, car ${reason}`);
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
    return {
        ...result,
        selectedPlayerNameList: invertedVoteMap.get(maxVote),
    };
}

async function processClairvoyant(playerList: PlayerV2[], clairvoyant: PlayerV2): Promise<PlayerV2> {
    try {
        const model = await llama.loadModel({
            modelPath: path.join(__dirname, "models", engine)
        });
        const plContext = await model.createContext({batchSize: 0});
        const plSession = new LlamaChatSession({contextSequence: plContext.getSequence()});
        const playerPrompt = `Ton nom est ${clairvoyant.name}, tu es la voyante du village et les habitants du village meurent toutes les nuits à cause des loups-garous. C'est la nuit, et tu dois choisir de découvrir le rôle d'un joueur : ${playerList.filter(p => p.name !== clairvoyant.name).map(p => p.name).join(",")}. Quel est le joueur dont tu souhaites connaître le rôle ? Réponds avec un JSON de la forme : { why: 'Créer une courte explication de ton choix en français', who: 'Nomme le joueur dont tu souhaites connaître le rôle' }. Réponds avec le JSON et rien d'autre avant ou après.`;
        const playerRes = await plSession.prompt(playerPrompt, {temperature: 0.1});
        console.log("Clairvoyant res ",playerRes)
        const jsonRes = JSON.parse(playerRes.replace("<|assistant|>","").replace("<|user|>",""));
        const seenPlayer = playerList.find(p => p.name === jsonRes.who.toLowerCase().normalize("NFC"));
        return {
            ...clairvoyant,
            roleDetail: {
                knownPlayerList: seenPlayer && clairvoyant.roleDetail?.knownPlayerList ? [...clairvoyant.roleDetail?.knownPlayerList, seenPlayer] : (clairvoyant.roleDetail?.knownPlayerList ?? [])
            }
        };
    } catch (error) {}
    return clairvoyant;
}

/**
 * doNightVote: Do a night round where wolves vote to eliminate a villager
 * @param playerList The list of all remaining players
 * @param playerVote Optional, the vote of the real player
 */
export async function doNightVote(playerList: PlayerV2[], playerVote?: string): Promise<NightResultV2> {
    playerList = randomizePlayerArray(playerList);
    console.log("🌙️ La nuit arrive !")
    const votes = [];
    if (playerVote) votes.push(playerVote);
    const result: NightResultV2 = {
        selectedPlayerNameList: [],
        reasons: [],
        updatedPlayerList: [...playerList]
    };
    const wolves = playerList.filter(p => p.role === 'Loup Garou');
    const villagers = playerList.filter(p => p.role !== 'Loup Garou');

    const clairvoyant = playerList.find(p => p.role === 'Voyante' && !p.isReal);
    if (clairvoyant) {
        result.updatedPlayerList = [...playerList.filter(p => p.role !== 'Voyante'), await processClairvoyant(playerList,clairvoyant)];
    }

    for (const wolf of wolves.filter(p => !p.isReal)) {
        console.log(`-> C'est à ${wolf.name} de choisir qui sera mangé ce soir !`);
        let target = 'None';
        let reason = '';
        try {
            const model = await llama.loadModel({
                modelPath: path.join(__dirname, "models", engine)
            });
            const plContext = await model.createContext({batchSize: 0});
            const plSession = new LlamaChatSession({contextSequence: plContext.getSequence()});
            const playerPrompt = `Ton nom est ${wolf.name}, tu es un Loup Garou et les habitants du village meurent toutes les nuits à cause des loups-garous. C'est la nuit, et tu dois choisir d'éliminer un villageois parmi : ${villagers.map(p => p.name).join(",")}. ${votes.length > 0 ? 'Tes partenaires ont voté pour '+ votes.join(',') +'. ' : ''} Qui veux tu éliminer ? Réponds avec un JSON de la forme : { why: 'Créer une courte explication de ton choix en français', who: 'Nomme le joueur que tu souhaites éliminer ou None si tu ne souhaites pas voter' }. Réponds avec le JSON et rien d'autre avant ou après.`;
            const playerRes = await plSession.prompt(playerPrompt, {temperature: 0.1});
            //console.log(" <- ",playerRes)
            try {
                const jsonRes = JSON.parse(playerRes.replace("<|assistant|>","").replace("<|user|>",""));
                target = jsonRes.who.toLowerCase().normalize("NFC");
            } catch {
                const curlyBracesInclusive = /\{([^}]+)\}/
                const arrRes = playerRes.replace("\n","").match(curlyBracesInclusive);
                if (arrRes) {
                    const jsonRes = JSON.parse(arrRes[0].replace("<|assistant|>","").replace("<|user|>",""));
                    target = jsonRes.who.toLowerCase().normalize("NFC");
                }
            }
        } catch (e) {
            console.error("Une erreur est survenue : ",e);
        }
        votes.push(target);
        console.log(` <- Je souhaite donc dévorer ${target}`);
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
    return {
        ...result,
        selectedPlayerNameList: invertedVoteMap.get(maxVote),
    };
}

/**
 * randomizePlayerArray: Randomize an array
 * @param array The array to randomize
 */
function randomizePlayerArray(array: any[]) {
    return array.map(value => ({ value, sort: Math.random() }))
        .sort((a, b) => a.sort - b.sort)
        .map(({ value }) => value)
}

export async function chooseCupidonLovers(playerList: PlayerV2[]): Promise<PlayerV2[]> {
    playerList = randomizePlayerArray(playerList);
    console.log("❤️ C'est l'heure de Cupidon !")
    const model = await llama.loadModel({
        modelPath: path.join(__dirname, "models", engine)
    });
    const plContext = await model.createContext({batchSize: 0});
    const plSession = new LlamaChatSession({contextSequence: plContext.getSequence()});
    const playerPrompt = `Sélectionne deux joueurs différents parmi la liste suivante : ${playerList.map(p => p.name).join(',')}. Réponds avec un JSON de la forme : { player1: 'Le premier joueur sélectionné', player2: 'Le deuxième joueur sélectionné, qui est différent du premier' }. Réponds avec le JSON et rien d'autre avant ou après.`;
    console.log(playerPrompt);
    const playerRes = await plSession.prompt(playerPrompt, {temperature: 0.1});
    console.log(playerRes);
    try {
        const jsonRes = JSON.parse(playerRes.replace("<|assistant|>","").replace("<|user|>",""));
        const player1Name = jsonRes.player1.toLowerCase().normalize("NFC");
        const player2Name = jsonRes.player2.toLowerCase().normalize("NFC");
        const p1 = playerList.find(p => p.name.toLowerCase().normalize("NFC") === player1Name);
        const p2 = playerList.find(p => p.name.toLowerCase().normalize("NFC") === player2Name);
        if (p1 && p2) return [p1, p2];
    } catch {
        const curlyBracesInclusive = /\{([^}]+)\}/
        const arrRes = playerRes.replace("\n","").match(curlyBracesInclusive);
        if (arrRes) {
            const jsonRes = JSON.parse(arrRes[0].replace("<|assistant|>","").replace("<|user|>",""));
            const player1Name = jsonRes.player1.toLowerCase().normalize("NFC");
            const player2Name = jsonRes.player2.toLowerCase().normalize("NFC");
            const p1 = playerList.find(p => p.name.toLowerCase().normalize("NFC") === player1Name);
            const p2 = playerList.find(p => p.name.toLowerCase().normalize("NFC") === player2Name);
            if (p1 && p2) return [p1, p2];
        }
    }
    return [];
}

export async function chooseHunterKill(playerList: PlayerV2[]): Promise<PlayerV2> {
    playerList = randomizePlayerArray(playerList);
    console.log("🔫️ C'est l'heure du chasseur !")
    const model = await llama.loadModel({
        modelPath: path.join(__dirname, "models", engine)
    });
    const plContext = await model.createContext({batchSize: 0});
    const plSession = new LlamaChatSession({contextSequence: plContext.getSequence()});
    const playerPrompt = `Sélectionne un joueur dans la liste suivante : ${playerList.map(p => p.name).join(',')}. Réponds avec un JSON de la forme : { player: 'Le joueur sélectionné' }. Réponds avec le JSON et rien d'autre avant ou après.`;
    console.log(playerPrompt);
    const playerRes = await plSession.prompt(playerPrompt, {temperature: 0.1});
    console.log(playerRes);
    try {
        const jsonRes = JSON.parse(playerRes.replace("<|assistant|>","").replace("<|user|>",""));
        const playerName = jsonRes.player.toLowerCase().normalize("NFC");
        return playerList.find(p => p.name.toLowerCase().normalize("NFC") === playerName);
    } catch {
        const curlyBracesInclusive = /\{([^}]+)\}/
        const arrRes = playerRes.replace("\n","").match(curlyBracesInclusive);
        if (arrRes) {
            const jsonRes = JSON.parse(arrRes[0].replace("<|assistant|>","").replace("<|user|>",""));
            const playerName = jsonRes.player.toLowerCase().normalize("NFC");
            return playerList.find(p => p.name.toLowerCase().normalize("NFC") === playerName);
        }
    }
    return undefined;
}
