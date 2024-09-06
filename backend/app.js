const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv').config();

const booksRoutes = require('./routes/books'); // Import du gestionnaire de route pour le chemin '/api/books'
const userRoutes = require('./routes/user'); // Import du gestionnaire de route pour le chemin '/api/auth'
const path = require('path');

// Création d'une application Express
const app = express();

// Connexion de l'application à Mongoose
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch((err) => console.log(`Connexion à MongoDB échouée ! ${err}`));

// Interception de toutes les requêtes ayant un Content-Type 'application/json', pour mettre leur body à disposition sur l'objet 'req'
app.use(express.json());

// Rajout de paramètres au Header pour éviter les erreur de CORS quand on fait une requête
app.use((req, res, next) => {
  // Middleware général, qui sera appliqué à toutes les routes / toutes les requêtes envoyées au serveur
  res.setHeader('Access-Control-Allow-Origin', '*'); // On autorise l'accès à l'API depuis n'importe quelle origine ('*')
  res.setHeader(
    // Headers autorisés
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization'
  );
  res.setHeader(
    // Verbes autorisés
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, DELETE, PATCH, OPTIONS'
  );
  next();
});

// Chemins et gestionnaires de routes :
app.use('/api/books', booksRoutes);
app.use('/api/auth', userRoutes);
app.use('/images', express.static(path.join(__dirname, 'images'))); // Multer

module.exports = app; // Export de l'application pour pouvoir y accéder depuis les autres fichiers du projet (notamment le serveur node)
