// Importer le module Express
import express from 'express';

// Créer une application Express
const app = express();

// Définir une route pour la page d'accueil
app.get('/', (req, res) => {
  res.send('Hello World Tester c\'est douter!');
});

// Définir une route pour renvoyer le numéro d'étape correspondant
app.get('/step/:stepNumber', (req, res) => {
    const stepNumber = req.params.stepNumber;
    res.send(`Numéro d'étape: ${stepNumber}`);
});

// Démarrer le serveur sur le port 3000
app.listen(3000, () => {
  console.log('Le serveur écoute sur le port 3000');
});