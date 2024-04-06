// Importer le module Express
import express from 'express';
import bodyParser from 'body-parser';

// Créer une application Express
const app = express();
app.use(bodyParser.json());

// Fonction pour retourner aléatoirement un joueur
function getRandomPlayer(players) {
    const randomIndex = Math.floor(Math.random() * players.length); // Générer un index aléatoire
    return players[randomIndex]; // Retourner le joueur correspondant à cet index
}

// Définir une route pour la page d'accueil
app.get('/', (req, res) => {
  res.send('Hello World Tester c\'est douter!');
});

// Définir une route pour renvoyer le numéro d'étape correspondant
app.get('/step/:stepNumber', (req, res) => {
    const stepNumber = req.params.stepNumber;
    res.send(`Numéro d'étape: ${stepNumber}`);
});

app.post('/jour', (req, res) => {
    const players = req.body.players; // Récupérer le tableau de joueurs depuis le corps de la requête
    console.log(players);
    const randomPlayer = getRandomPlayer(players); // Obtenir un joueur aléatoire
    res.json({ name: randomPlayer.name, message: 'Le village a désigné'});
});

app.post('/nuit', (req, res) => {
    const players = req.body.players; // Récupérer le tableau de joueurs depuis le corps de la requête
    console.log(players);
    const randomPlayer = getRandomPlayer(players); // Obtenir un joueur aléatoire
    res.json({ name: randomPlayer.name, message: 'Les loups-garous ont décidés d\'éliminer'});
});

// Démarrer le serveur sur le port 3000
app.listen(3000, () => {
  console.log('Le serveur écoute sur le port 3000');
});