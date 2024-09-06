const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator'); // Import d'un package permettant de vérifier le caractère unique d'une valeur

const bookSchema = mongoose.Schema({
  userId: {
    // Identifiant MongoDB unique de l'utilisateur qui a créé le livre
    type: String,
    required: true,
  },
  title: {
    // Titre du livre
    type: String,
    required: true,
    unique: true,
  },
  author: {
    // Auteur du livre
    type: String,
    required: true,
  },
  imageUrl: {
    // Illustration / couverture du livre
    type: String,
    required: true,
  },
  year: {
    // Année de publication du livre
    type: Number,
    required: true,
  },
  genre: {
    // Genre du livre
    type: String,
    required: true,
  },
  ratings: [
    {
      userId: {
        // Identifiant MongoDB unique de l'utilisateur qui a noté le livre
        type: String,
        required: false,
      },
      grade: {
        // note donné à un livre
        type: Number,
        required: false,
        default: 0,
        min: 0,
        max: 5,
      },
    },
  ],
  averageRating: {
    // Note moyenne du livre
    type: Number,
    default: 0,
  },
});

bookSchema.plugin(uniqueValidator); // Pour éviter d'avoir plusieurs livres avec le même titre

module.exports = mongoose.model('Book', bookSchema);
