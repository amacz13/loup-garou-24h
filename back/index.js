import {fileURLToPath} from "url";
import path from "path";
import {LlamaModel, LlamaContext, LlamaChatSession} from "node-llama-cpp";
import PromptSync from "prompt-sync";
import { Express } from "express";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const model = new LlamaModel({
    modelPath: path.join(__dirname, "models", "openchat_3.5.Q5_K_M.gguf"),
    temperature: 0.8,
});
const context = new LlamaContext({model});
const session = new LlamaChatSession({context});

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

const playerPrompt = 'GPT4 User: Paul est Villageois. Pierre est Villageois. Jacques est Loup Garou. Léa est Loup Garou. Marie est Villageois<|end_of_turn|>GPT4 Assistant:';
const playerRes = await session.prompt(playerPrompt);
console.log(playerRes);

let userSentence = '';
do {
    userSentence = PromptSync()(`Saisir votre question : `);
    if (userSentence !== 'Bye') {
        const a1 = await session.prompt(userSentence);
        console.log(a1);
    }
} while (userSentence !== 'Bye');
