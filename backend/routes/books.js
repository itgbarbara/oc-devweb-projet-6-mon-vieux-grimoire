const express = require('express');

// Import des middleware
const auth = require('../middleware/auth'); // Gestion de l'authentification
const upload = require('../middleware/upload'); // Gestion du téléchargement des fichiers
const format = require('../middleware/format'); // Gestion de l'optimisation des fichiers
const bookCtrl = require('../controllers/books'); // Exécution des actions dans la BDD 'Book'

// Création d'un router
const router = express.Router();

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
router.post('/', auth, upload, format, bookCtrl.addBook);

// Route pour mettre à jour un livre dans la base de données (PUT)
router.put('/:id', auth, upload, format, bookCtrl.updateBook);

// Route pour supprimer un livre de la base de données (DELETE)
router.delete('/:id', auth, bookCtrl.deleteBook);

// Export du router
module.exports = router;
