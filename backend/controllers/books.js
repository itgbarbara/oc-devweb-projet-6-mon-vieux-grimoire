const Book = require('../models/Book'); // Import du modèle 'Book'
const fs = require('fs'); // Import du package 'file system'

// Logique pour récupérer les 3 livres ayant la meilleure note moyenne (GET)
exports.getBestRatedBooks = (req, res) => {
  Book.find()
    .then((books) =>
      books.sort((a, b) => b.averageRating - a.averageRating).slice(0, 3)
    )
    .then((bestRatedBooks) => res.status(200).json(bestRatedBooks))
    .catch((error) => {
      res.status(404).json({ error });
    });
};

// Logique pour récupérer tous les livres de la base de données
exports.getAllBooks = (req, res) => {
  Book.find()
    .then((books) => res.status(200).json(books))
    .catch((error) => res.status(404).json({ error }));
};

// Logique pour récupérer UN livre dans la base de données
exports.getOneBook = (req, res) => {
  Book.findOne({ _id: req.params.id })
    .then((book) => res.status(200).json(book))
    .catch((error) => res.status(404).json({ error }));
};

// Logique pour définir la note d'un livre (POST)
exports.rateBook = (req, res) => {
  Book.findOne({ _id: req.params.id }) // On cherche l'objet correspond au livre qu'on veut noter dans la base de données
    .then((book) => {
      // Vérification de l'existence du livre
      if (!book) {
        res.status(404).json({ message: 'Livre non trouvé' });
      }

      // Récupération du tableau de notes existant associé au livre
      const ratings = book.ratings;

      // Création d'un objet pour la nouvelle note transmise par la requête
      const userRating = {
        userId: req.auth.userId,
        grade: req.body.rating, // D'après le body de la requête front
      };

      // Vérification des droits
      if (
        ratings.some((rating) => rating.userId.toString() === req.auth.userId)
      ) {
        res.status(400).json({ message: 'Vous avez déjà noté ce livre' });
      }

      // Ajout de la note au tableau de notes du livre
      ratings.push(userRating);

      // Calcul et mise à jour de la note moyenne
      const ratingsSum = ratings.reduce(
        (acc, currentValue) => acc + currentValue.grade,
        0 // Initialisation de l'accumulateur à zéro
      );

      book.averageRating =
        ratings.length > 0
          ? parseFloat(ratingsSum / ratings.length).toFixed(1) // Moyenne arrondie à 1 chiffre après la vircule
          : 0;

      // Renvoi de la fiche mise à jour et sauvegardée dans la base
      book
        .save()
        .then((updatedBook) => res.status(200).json(updatedBook))
        .catch((error) => res.status(400).json({ error }));
    })
    .catch((error) => res.status(400).json({ error }));
};

// Logique pour enregistrer un nouveau livre dans la base de données
exports.addBook = (req, res) => {
  const bookObject = JSON.parse(req.body.book); // Le corps de la requête contient une chaîne de caractères 'book', qui est un objet Book converti en string.

  delete bookObject._id; // Suppression du faux id envoyé par le front-end
  delete bookObject._userId; // Suppression du champs UserId envoyé par le front-end pour éviter les fraudes

  const book = new Book({
    // Création d'un nouveau livre
    ...bookObject,
    userId: req.auth.userId, // Remplacement du champs UserId envoyé par le client par le _userId extrait du token
    imageUrl: `${req.protocol}://${req.get('host')}/images/${
      req.file.filename
    }`, // http://localhost:4000/images/nomfichier.extension
  });
  book
    .save() // Sauvegarde du livre dans la BDD
    .then(() => res.status(201).json({ Message: 'Livre enregistré' }))
    .catch((error) => {
      console.error("Erreur lors de l'enregistrement d'un livre :", error);
      res.status(400).json({ error });
    });
};

// Logique pour supprimer un livre dans la base de données
exports.deleteBook = (req, res) => {
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      if (book.userId != req.auth.userId) {
        // Vérification des droits : si l'userId de création ne correspond pas à l'userId qui fait la requête...
        res.status(401).json({ message: 'Non autorisé' }); // alors erreur
      } else {
        // Sinon : suppression du livre
        const filename = book.imageUrl.split('/images/')[1]; // Extraction du nom de fichier
        fs.unlink(`images/${filename}`, () => {
          // Suppression du fichier puis callback à exécuter après
          Book.deleteOne({ _id: req.params.id }) // Suppression du livre de la BDD
            .then(() => res.status(200).json({ message: 'Objet supprimé' }))
            .catch((error) => res.status(401).json({ error }));
        });
      }
    })
    .catch((error) => res.status(500).json({ error }));
};

// Logique pour mettre à jour un livre de la base de données
exports.updateBook = (req, res) => {
  const bookObject = req.file // est-ce que req.file existe ? (L'utilisateur a mis à jour l'image)
    ? {
        // Si oui
        ...JSON.parse(req.body.book), // On analyse la chaîne de caractères
        imageUrl: `${req.protocol}://${req.get('host')}/images/${
          req.file.filename
        }`, // On ajoute le chemin de l'image
      }
    : {
        // Si non
        ...req.body, // On récupère simplement le contenu du body de la requête
      };
  delete bookObject._userId; // On supprime l'userId envoyé par le front-end
  Book.findOne({ _id: req.params.id }) // On cherche l'objet correspond au livre qu'on veut noter dans la Base de données
    .then((book) => {
      if (book.userId != req.auth.userId) {
        // Vérification des droits : si l'userId de création ne correspond pas à l'userId qui fait la requête...
        res.status(401).json({ message: 'Non autorisé' }); // alors erreur
      } else {
        // Sinon : mise à jour du livre
        if (req.file) {
          // Si on uploadé une nouvelle image, on supprimer l'ancienne puis on met à jour le livre
          const filename = book.imageUrl.split('/images/')[1]; // Extraction du nom de fichier
          fs.unlink(`images/${filename}`, () => {
            Book.updateOne(
              { _id: req.params.id }, // Paramètre de comparaison
              { ...bookObject, _id: req.params.id } // On met à jour bookObject
            )
              .then(() => res.status(200).json({ message: 'Objet modifié' }))
              .catch((error) => res.status(401).json({ error }));
          });
        } else {
          // Si on n'a pas uploadé de nouvelle image, on met simplement à jour le livre
          Book.updateOne(
            { _id: req.params.id }, // Paramètre de comparaison
            { ...bookObject, _id: req.params.id } // On met à jour bookObject
          )
            .then(() => res.status(200).json({ message: 'Objet modifié' }))
            .catch((error) => res.status(401).json({ error }));
        }
      }
    })
    .catch((error) => res.status(400).json({ error }));
};
