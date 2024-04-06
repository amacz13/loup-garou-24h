import {fileURLToPath} from "url";
import path from "path";
import {LlamaModel, LlamaContext, LlamaChatSession} from "node-llama-cpp";
import PromptSync from "prompt-sync";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const model = new LlamaModel({
    modelPath: path.join(__dirname, "models", "phi-2.Q5_K_M.gguf")
});
const context = new LlamaContext({model});
const session = new LlamaChatSession({context});

let userSentence = '';
do {
    userSentence = PromptSync()(`Saisir votre question : `);
    if (userSentence !== 'Bye') {
        const a1 = await session.prompt(userSentence);
        console.log(a1);
    }
} while (userSentence !== 'Bye');
