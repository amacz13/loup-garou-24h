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

export interface Player {
    name: string;
    role: string;
    personality: string;
    isReal?: boolean;
}

export interface Result {
    selectedPlayerNameList: string[];
    reasons: PlayerReason[]
}

export interface PlayerReason {
    playerName: string;
    reason: string;
}

/**
 * doDayVote: Do a day round where all players vote to eliminate one of them
 * @param playerList The list of all remaining players
 * @param playerVote Optional, the vote of the real player
 */
export async function doDayVote(playerList: Player[], playerVote?: string): Promise<Result> {
    playerList = randomizePlayerArray(playerList);
    console.log("☀️ Le jour se lève !")
    const votes = [];
    const votesAsSet = new Set<string>();
    if (playerVote) {
        votes.push(playerVote);
        votesAsSet.add(playerVote);
    }
    const result: Result = {
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
            const playerPrompt = `Ton nom est ${player.name}, tu es un ${player.role} et les habitants du village meurent toutes les nuits à cause des loups-garous. Les autres joueurs sont ${ player.role === 'Loup Garou' ? playerList.filter(p => p.role !== 'Loup Garou' ).map(p => p.name).join(",") : playerList.filter(p => p.name !== player.name ).map(p => p.name).join(",")}. ${votesAsSet.size > 0 ? "Actuellement, les joueurs accusés sont " + [...votesAsSet].join(',')+". " : ""} C'est à toi de voter, qui veux tu éliminer ? Réfléchis étape par étape. Réponds avec un JSON de la forme : { why: 'Créer une courte explication drôle et rigolote de ton choix en français', who: 'Nomme le joueur que tu souhaites éliminer ou None si tu ne souhaites pas voter'}. Réponds avec le JSON et rien d'autre avant ou après.`;
            const playerRes = await plSession.prompt(playerPrompt, {temperature: 0.1});
            //console.log(" <- ",playerRes)
            const curlyBracesInclusive = /\{([^}]+)\}/
            const arrRes = playerRes.replace("\n","").match(curlyBracesInclusive)
            console.log("arrRes",arrRes)
            if (arrRes) {
                const jsonRes = JSON.parse(arrRes[0].replace("<|assistant|>","").replace("<|user|>",""));
                target = jsonRes.who.toLowerCase().normalize("NFC");
                reason = jsonRes.why;
                votesAsSet.add(target);
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

/**
 * doNightVote: Do a night round where wolves vote to eliminate a villager
 * @param playerList The list of all remaining players
 * @param playerVote Optional, the vote of the real player
 */
export async function doNightVote(playerList: Player[], playerVote?: string): Promise<Result> {
    playerList = randomizePlayerArray(playerList);
    console.log("🌙️ La nuit arrive !",playerList);
    const votes = [];
    if (playerVote) votes.push(playerVote);
    const result: Result = {
        selectedPlayerNameList: [],
        reasons: [],
    };
    const wolves = playerList.filter(p => p.role === 'Loup Garou');
    const villagers = playerList.filter(p => p.role !== 'Loup Garou');

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
            const curlyBracesInclusive = /\{([^}]+)\}/
            const arrRes = playerRes.replace("\n","").match(curlyBracesInclusive)
            console.log("arrRes",arrRes)
            if (arrRes) {
                const jsonRes = JSON.parse(arrRes[0].replace("<|assistant|>","").replace("<|user|>",""));
                target = jsonRes.who.toLowerCase().normalize("NFC");
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