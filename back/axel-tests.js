import {fileURLToPath} from "url";
import path from "path";
import {LlamaModel, LlamaContext, LlamaChatSession, getLlama} from "node-llama-cpp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const llama = await getLlama();
llama.logLevel = 'disabled';
const model = await llama.loadModel({
    modelPath: path.join(__dirname, "models", "openchat_3.5.Q5_K_M.gguf"),
    temperature: 0.8,
});
const context = await model.createContext();
const session = new LlamaChatSession({contextSequence: context.getSequence()});

const initPrompt = "GPT4 User: Les joueurs sont divisés en deux camps : les villageois (certains d'entre eux jouant un rôle spécial) et les loups-garous. Le but des villageois est de découvrir et d'éliminer les loups-garous, et le but des loups-garous est de ne pas se faire démasquer et d'éliminer tous les villageois.\n" +
    "\n" +
    "Les tours de jeu sont rythmés par une période de jour et une période de nuit.\n" +
    "\n" +
    "Durant la nuit, tous les joueurs ont les yeux fermés et ne doivent pas communiquer. Appelés par le meneur de jeu, les loups-garous se réveillent, et désignent ensemble un villageois qui sera leur victime.\n" +
    "\n" +
    "Le jour revenu, tout le monde se réveille et ouvre les yeux et le meneur de jeu révèle l'identité de la victime. Les victimes n'interviennent plus jusqu'à la fin du jeu mais pourront garder les yeux ouverts et y assister. Les villageois vont tenter de découvrir qui sont les loups-garous par déductions, discours, révélations… Les loups-garous (qui participent également aux débats en tant que villageois) doivent éviter de se faire incriminer en détournant les soupçons sur d'autres personnes. Il y a donc un temps de discussion au cours duquel chacun tente de découvrir la véritable identité de chaque joueur.\n" +
    "\n" +
    "À la fin du débat, chaque joueur pointe du doigt une personne qu'il suspecte d'être loup-garou. Celui étant désigné par la majorité est \"exécuté\" et le meneur montre son identité. Il est donc éliminé, puis le jeu recommence à la tombée de la nuit.<|end_of_turn|>GPT4 Assistant:";

const initRes = await session.prompt(initPrompt);
console.log(initRes);

const compressed = await session.prompt("GPT4 User: Résume moi les règles.<|end_of_turn|>GPT4 Assistant:");
console.log(compressed);

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
]

for (const player of players) {
    console.log(`Jeu en tant que ${player.name}`);
    const plContext = await model.createContext();
    const plSession = new LlamaChatSession({contextSequence: plContext.getSequence()});
    const otherPlayers = players.filter(p => p.name !== player.name).map(p => p.name);
    const playerPrompt = `GPT4 User: Voici les règles du jeu : ${compressed}. Tu incarnes ${player.name}, tu es un ${player.role} et ta personnalité est ${player.personality}. Les autres joueurs sont ${otherPlayers.join(", ")}. ${ player.role === 'Loup Garou' ? `Les autres loups-garous sont ${players.filter(p => p.role === 'Loup Garou' && p.name !== player.name).map(p => p.name).join(",")}. ` : ''}Contre qui votes-tu ?<|end_of_turn|>GPT4 Assistant:`;
    console.log(` -> ${playerPrompt}`);
    const playerRes = await plSession.prompt(playerPrompt);
    console.log(` <- ${playerRes}`);
}

process.exit();