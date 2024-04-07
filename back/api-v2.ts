// Importer le module Express
import express, {Request, Response } from "express";
import bodyParser from "body-parser";
import { PlayerV2, ResultV2, doDayVote, doNightVote } from "./game-engine-v2.js";

// Créer une application Express
const app = express();
app.use(bodyParser.json());


// Fonction pour retourner aléatoirement un joueur
function getRandomPlayer(players: PlayerV2[]): PlayerV2 {
    const randomIndex = Math.floor(Math.random() * players.length); // Générer un index aléatoire
    return players[randomIndex]; // Retourner le joueur correspondant à cet index
}

function getRandomPlayerName(playerNames: string[]): string {
    const randomIndex = Math.floor(Math.random() * playerNames.length);
    return playerNames[randomIndex];
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
    const players: PlayerV2[] = req.body.players; // Récupérer le tableau de joueurs depuis le corps de la requête
    const target:string = req.body.target;
    for (let player of players) {
        if (player.power) {
            player.role = player.power;
        }
    }
    console.log(players);
    doDayVote(players, target).then( (response : ResultV2) => {
        console.log(response);
        let winner: string = response.selectedPlayerNameList[0];
        if(response.selectedPlayerNameList.length > 1 ) {
            // On a une égalité, on prends un joueur au pif parmis l'égalité
            winner = getRandomPlayerName(response.selectedPlayerNameList);
        } 
        res.json({ name: winner, message: 'Le village a désigné', reasons: response.reasons });
    }).catch((error) => {
        console.error("Something went wrong", error);
        res.status(500).send("Une erreur s'est produite lors de la récupération des données.");
    });
});

app.post('/nuit', (req: Request, res: Response) => {
    const players: PlayerV2[] = req.body.players; // Récupérer le tableau de joueurs depuis le corps de la requête
    const target:string = req.body.target;
    for (let player of players) {
        if (player.power) {
            player.role = player.power;
        }
    }
    console.log(players);
    console.log(target);
    doNightVote(players, target).then((response : ResultV2) => {
        console.log(response);
        let winner: string = response.selectedPlayerNameList[0];
        if(response.selectedPlayerNameList.length > 1 ) {
            // On a une égalité, on prends un joueur au pif parmis l'égalité
            winner = getRandomPlayerName(response.selectedPlayerNameList);
        } 
        res.json({ name: winner, message: 'Les loups-garous ont décidé d\'éliminer'});
    });
});

// Démarrer le serveur sur le port 3000
app.listen(3000, () => {
    console.log('Le serveur écoute sur le port 3000');
});