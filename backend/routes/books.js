const express = require('express'); // Import du package Express
const auth = require('../middleware/auth'); // Import du middleware qui gère l'authentification
const upload = require('../middleware/upload'); // Import du middleware qui gère le téléchargement de fichiers
const format = require('../middleware/format'); // Import du middleware qui gère le formattage de fichiers
const router = express.Router(); // Création d'un router avec la méthode .Router() d'Express

// const Book = require('../models/Book') // Import du modèle 'Book'
const bookCtrl = require('../controllers/books'); // Import des fonctions

// PARAMETRAGE DES ROUTES //

// Route pour récupérer les 3 livres ayant la meilleure note moyenne (GET)
router.get('/bestrating', bookCtrl.getBestRatedBooks);

// Route pour récupérer tous les livres de la base de données (GET)
router.get('/', bookCtrl.getAllBooks);

// Route pour récupérer UN livre dans la base de données (GET)
router.get('/:id', bookCtrl.getOneBook);

// Route pour définir la note d'un livre (POST)
router.post('/:id/rating', auth, bookCtrl.rateBook);

// Route pour créer un nouveau livre dans la base de données (POST)
router.post('/', auth, upload, format, bookCtrl.addBook); // => /!\ Impossible de créer plusieurs livres avec le même compte utilisateur

// Route pour mettre à jour un livre dans la base de données (PUT)
router.put('/:id', auth, upload, format, bookCtrl.updateBook); // IL FAUT SUPPRIMER L'ANCIEN FICHIER

// Route pour supprimer un livre de la base de données (DELETE)
router.delete('/:id', auth, bookCtrl.deleteBook);

module.exports = router; // Export du router
