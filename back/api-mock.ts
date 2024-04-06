// Importer le module Express
import express, {Request, Response } from "express";
import bodyParser from "body-parser";
import { Player, doDayVote } from "./game-engine.js";

// Créer une application Express
const app = express();
app.use(bodyParser.json());


// Fonction pour retourner aléatoirement un joueur
function getRandomPlayer(players: Player[]): Player {
    const randomIndex = Math.floor(Math.random() * players.length); // Générer un index aléatoire
    return players[randomIndex]; // Retourner le joueur correspondant à cet index
}

// Définir une route pour la page d'accueil
app.get('/', (req: Request, res: Response) => {
    res.send('Hello World Tester c\'est douter!');
});

// Définir une route pour renvoyer le numéro d'étape correspondant
app.get('/step/:stepNumber', (req: Request, res: Response) => {
    const stepNumber = req.params.stepNumber;
    res.send(`Numéro d'étape: ${stepNumber}`);
});

app.post('/jour', (req: Request, res: Response) => {
    const players: Player[] = req.body.players; // Récupérer le tableau de joueurs depuis le corps de la requête
    console.log(players);
    const randomPlayer = getRandomPlayer(players); // Obtenir un joueur aléatoire
    res.json({ name: randomPlayer.name, message: 'Le village a désigné', "reasons":[{"playerName":"Jacqueline","reason":"Bien que tous les joueurs soient suspects, j'ai remarqué que Bertrand semble toujours se retirer de la scène lorsque les victimes sont attaquées. Cela me suggère qu'il pourrait être impliqué dans ces crimes et je pense donc qu'il est temps d'éliminer cet individu."},{"playerName":"Charles Edouard","reason":"Bertrand est le seul joueur à avoir déjà été éliminé et réapparu plus tard. Nous ne savons pas s'il est vraiment un loup-garou, mais il serait préférable de ne pas prendre de risques et d'éliminer lui cette fois."},{"playerName":"Pauline","reason":""},{"playerName":"Pierre Henry Mathieu","reason":"Bertrand a été suspecté de collusion avec les loups-garous. Son comportement étrange et son refus d'aider à construire des barrières contre les loups-garous ont suscité des soupçons. De plus, il a récemment été vu dans les bois à l'heure où les loups-garous attaquent le village. Nous devons éliminer Bertrand avant qu'il ne nous fasse plus de mal."},{"playerName":"Bertrand","reason":"Bien que tous les habitants du village soient menacés par les loups-garous, j'ai décidé d'éliminer Jacqueline. Elle a été suspectée plusieurs fois de posséder des caractéristiques de loup-garou et a refusé de se soumettre à une vérification médicale. Son comportement suspecte et son attitude défiante nous ont déjà causé beaucoup d'inquiétude, donc je pense que c'est mieux pour la sécurité du village de l'éliminer."}] });
});

app.post('/nuit', (req: Request, res: Response) => {
    const players: Player[] = req.body.players; // Récupérer le tableau de joueurs depuis le corps de la requête
    console.log(players);
    const randomPlayer = getRandomPlayer(players); // Obtenir un joueur aléatoire
    res.json({ name: randomPlayer.name, message: 'Les loups-garous ont décidés d\'éliminer' });
});

// Démarrer le serveur sur le port 3000
app.listen(3000, () => {
    console.log('Le serveur écoute sur le port 3000');
});