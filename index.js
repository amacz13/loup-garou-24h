import {fileURLToPath} from "url";
import path from "path";
import {LlamaModel, LlamaContext, LlamaChatSession} from "node-llama-cpp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const model = new LlamaModel({
    modelPath: path.join(__dirname, "models", "phi-2.Q5_K_M.gguf")
});
const context = new LlamaContext({model});
const session = new LlamaChatSession({context});


const q1 = "Bonjour, je suis Axel ! Comment vas-tu ?";
console.log("User: " + q1);

const a1 = await session.prompt(q1);
console.log("AI: " + a1);