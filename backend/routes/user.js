const express = require('express'); // Import du package Express

// Import des middleware
const userCtrl = require('../controllers/user');

// Création d'un router
const router = express.Router();

// PARAMETRAGE DES ROUTES //

// Route pour ajouter un utilisateur à la base de données (POST)
router.post('/signup', userCtrl.signup); // éclaration du segment final de la route. Le reste de l'url de la route est déclaré dans app.js

// Route pour connecter un utilisateur (POST)
router.post('/login', userCtrl.login);

// Export du router
module.exports = router;
