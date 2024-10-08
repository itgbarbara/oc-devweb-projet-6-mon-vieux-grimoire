const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator'); // Import d'un package permettant de vérifier le caractère unique d'une valeur

const userSchema = mongoose.Schema({
  email: {
    // Adresse e-mail de l'utilisateur [unique]
    type: String,
    required: true,
    unique: true,
  },
  password: {
    // Mot de passe haché de l'utilisateur
    type: String,
    required: true,
  },
});

userSchema.plugin(uniqueValidator); // Pour éviter d'avoir plusieurs utilisateurs avec la même adresse mail

module.exports = mongoose.model('User', userSchema);
