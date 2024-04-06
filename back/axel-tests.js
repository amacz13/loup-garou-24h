import {fileURLToPath} from "url";
import path from "path";
import {LlamaModel, LlamaContext, LlamaChatSession, getLlama} from "node-llama-cpp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const llama = await getLlama();
llama.logLevel = 'disabled';
const model = await llama.loadModel({
    modelPath: path.join(__dirname, "models", "openchat_3.5.Q5_K_M.gguf"),
    temperature: 0.1,
});

const players = [
    {
        name: "Pierre",
        role: "Loup Garou",
        personality: "Courageux, Audacieux",
    },{
        name: "Marie",
        role: "Loup Garou",
        personality: "Timide, Prudente",
    },{
        name: "Léa",
        role: "Villageois",
        personality: "Brave, Expressive",
    },{
        name: "Martine",
        role: "Villageois",
        personality: "Maline, Stratège",
    },{
        name: "Paul",
        role: "Villageois",
        personality: "Idiot, Drôle",
    }
];

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


for (const player of players) {
    console.log(`Jeu en tant que ${player.name}`);
    const plContext = await model.createContext();
    const plSession = new LlamaChatSession({contextSequence: plContext.getSequence()});
    const otherPlayers = players.filter(p => p.name !== player.name).map(p => p.name);
    const playerPrompt = `GPT4 User: Ton nom est ${player.name}, tu es un ${player.role} et les habitants du village meurent toutes les nuits à cause des loups-garous. Les autres joueurs sont ${otherPlayers.join(", ")}. ${ player.role === 'Loup Garou' ? `Les autres loups-garous sont ${players.filter(p => p.role === 'Loup Garou' && p.name !== player.name).map(p => p.name).join(",")}. ` : 'Tu dois voter pour tuer le joueur que tu suspectes être un loup garou'}C'est à toi de voter, qui veux tu éliminer ? Réfléchis étape par étape. Réponds avec un JSON de la forme : { why: 'Créer une courte explication de ton choix', who: 'Nomme le joueur que tu souhaites éliminer ou None si tu ne souhaites pas voter'}. Réponds avec le JSON et rien d'autre avant ou après. <|end_of_turn|>GPT4 Assistant:`;
    console.log(` -> ${playerPrompt}`);
    const playerRes = await plSession.prompt(playerPrompt);
    console.log(` <- ${playerRes}`);
}

process.exit();