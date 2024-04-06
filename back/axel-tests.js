import {fileURLToPath} from "url";
import path from "path";
import {LlamaModel, LlamaContext, LlamaChatSession, getLlama} from "node-llama-cpp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const llama = await getLlama();
llama.logLevel = 'error';

const players = [
    {
        name: "Léa",
        role: "Villageois",
        personality: "Brave, Expressive",
    },{
        name: "Pierre",
        role: "Loup Garou",
        personality: "Courageux, Audacieux",
    },{
        name: "Marie",
        role: "Loup Garou",
        personality: "Timide, Prudente",
    },{
        name: "Martine",
        role: "Villageois",
        personality: "Maline, Stratège",
    },{
        name: "Paul",
        role: "Villageois",
        personality: "Idiot, Drôle",
    }
]/*.map(value => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value);*/

/*console.log("C'est la nuit 🌙");
const loups = players.filter(player => player.role === "Loup Garou");
const villageois = players.filter(player => player.role === "Villageois");
console.log(`Les loups garous (${loups.map(l => l.name).join(',')}) se réveillent`);

for (const loup of loups) {
    const otherPlayers = players.filter(p => p.name !== loup.name).map(p => p.name);
    const plContext = await model.createContext();
    const plSession = new LlamaChatSession({contextSequence: plContext.getSequence()});
    const playerPrompt = `GPT4 User: ${initPrompt}. Ton nom est ${loup.name}, tu es un ${loup.role} et ta personnalité est ${loup.personality}. Les villageois sont ${villageois.map(v => v.name + ' qui est ' + v.personality).join(", ")}. Les autres loups-garous sont ${loups.filter(p => p.name !== loup.name).map(p => p.name).join(",")}. En tant que loup garou, quel villageois souhaites-tu éliminer ? ?<|end_of_turn|>GPT4 Assistant:`;
    console.log(` -> ${playerPrompt}`);
    const playerRes = await plSession.prompt(playerPrompt);
    console.log(` <- ${playerRes}`);
}*/

const votes = [];

for (const player of players) {
    console.log(`-> C'est à ${player.name} de voter !`);
    const model = await llama.loadModel({
        modelPath: path.join(__dirname, "models", "zephyr-7b-beta.Q4_K_M.gguf"),
        temperature: 0.1,
    });
    const plContext = await model.createContext({batchSize: 0});
    const plSession = new LlamaChatSession({contextSequence: plContext.getSequence()});
    const otherPlayers = players.filter(p => p.name !== player.name).map(p => p.name);
    //const playerPrompt = `GPT4 User: Ton nom est ${player.name}, tu es un ${player.role} et les habitants du village meurent toutes les nuits à cause des loups-garous. Les autres joueurs sont ${otherPlayers.join(", ")}. ${ player.role === 'Loup Garou' ? `Les autres loups-garous sont ${players.filter(p => p.role === 'Loup Garou' && p.name !== player.name).map(p => p.name).join(",")}. ` : 'Tu dois voter pour tuer le joueur que tu suspectes être un loup garou'}C'est à toi de voter, qui veux tu éliminer ? Réfléchis étape par étape. Réponds avec un JSON de la forme : { why: 'Créer une courte explication de ton choix', who: 'Nomme le joueur que tu souhaites éliminer ou None si tu ne souhaites pas voter'}. Réponds avec le JSON et rien d'autre avant ou après. <|end_of_turn|>GPT4 Assistant:`;
    const playerPrompt = `Ton nom est ${player.name}, tu es un ${player.role} et les habitants du village meurent toutes les nuits à cause des loups-garous. Les autres joueurs sont ${ player.role === 'Loup Garou' ? players.filter(p => p.role !== 'Loup Garou' ).map(p => p.name).join(",") : players.filter(p => p.name !== player.name ).map(p => p.name).join(",")}. C'est à toi de voter, qui veux tu éliminer ? Réfléchis étape par étape. Réponds avec un JSON de la forme : { why: 'Créer une courte explication de ton choix en français', who: 'Nomme le joueur que tu souhaites éliminer ou None si tu ne souhaites pas voter'}. Réponds avec le JSON et rien d'autre avant ou après.`;
    //console.log(` -> ${playerPrompt}`);
    const playerRes = await plSession.prompt(playerPrompt);
    const jsonRes = JSON.parse(playerRes.replace("<|assistant|>",""));
    votes.push(jsonRes.who);
    console.log(` <- Je vote contre ${jsonRes.who}, car ${jsonRes.why}`);
    await plSession.dispose();
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
    if (value > maxVote) maxVote = value;
});

const tie = invertedVoteMap.get(maxVote).length > 1;
if (tie) {
    console.log(`Il y a égalité entre ${invertedVoteMap.get(maxVote).join(' et ')} !`);
} else {
    console.log(`${invertedVoteMap.get(maxVote)[0]} est éliminé !`)
}

process.exit();