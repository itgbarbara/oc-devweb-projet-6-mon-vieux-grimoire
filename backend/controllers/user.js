const bcrypt = require('bcrypt'); // Import du package bcrypt
const jwt = require('jsonwebtoken'); // Import du package jsonwebtoken
const dotenv = require('dotenv').config();
const User = require('../models/User'); // Import du modèle 'User'

// Logique pour ajouter un utilisateur à la base de données
exports.signup = (req, res, next) => {
  bcrypt
    .hash(req.body.password, 10) // fonction de hashage du mdp passé dans le body de la requête post, en faisant 10 tours de hashage. fonction asynchrone qui renvoit une Promise
    .then((hash) => {
      // Récupération du hash généré, et création d'un nouvel utilisateur à partir du modèle 'User'
      const user = new User({
        email: req.body.email, // Récupération de l'email passé dans le body de la requête post
        password: hash, // récupération du hash
      });
      user
        .save() // Sauvegarde de l'utilisateur dans la BDD
        .then(() => res.status(201).json({ message: 'Utilisateur créé' })) // Si succès
        .catch((error) => res.status(400).json({ error })); // Si erreur
    })
    .catch((error) => res.status(500).json({ error }));
};

// Logique pour connecter un utilisateur
// Vérification de l'existence d'un utilisateur dans la BDD, et si le mdp transmis par le client correspond à cet utilisateur
exports.login = (req, res, next) => {
  User.findOne({ email: req.body.email }) // On passe à la méthode .findOne() du modèle 'User' un objet qui va servir de filtre (sélecteur). On cherche l'email saisi par le client dans la BDD. Retourne une promesse.
    .then((user) => {
      // On récupère la valeur trouvée par notre requête dans la BDD
      if (user === null) {
        // Si l'utilisateur n'existe pas
        res
          .status(401) // Unauthorized
          .json({ message: 'Paire identifiant/mot de passe incorrecte' });
      } else {
        // Si l'utilisateur existe, on compare le mdp de la BDD avec le mdp transmis par le client
        bcrypt
          .compare(req.body.password, user.password) // On compare le mdp transmis dans le body de la requête, avec le mdp en BDD pour cet utilisateur. Renvoie une promesse
          .then((valid) => {
            // résultat de la méthode .compare() => booléen (soit les hash correspondent à la même chaîne de caractère, soit ils ne correspondent pas)
            if (!valid) {
              // si valid === false
              res
                .status(400)
                .json({ message: 'Paire identifiant/mot de passe incorrecte' });
            } else {
              // si valid === true
              res.status(200).json({
                // On retourne un objet avec l'id et le token pour authentifier les requêtes
                userId: user._id,
                token: jwt.sign(
                  // On utilise la méthode .sign() de jsonwebtoken pour chiffrer un nouveau token.
                  // on lui passe un payload personnalisé = données qu'on veut encoder à l'intérieur du token.
                  { userId: user._id }, // Assure que la requête corresponde bien à ce userId. Utile pour la création et la modification d'objets
                  process.env.SECRET_KEY, // Clé secrète pour l'encodage
                  { expiresIn: '24h' } // Configuration. Chaque token durera 24h et ne sera plus valable au-delà
                ), // Token qui sera vérifié à chaque requête effectuée par le front-end pour vérifier l'authentification de l'utilisateur
              });
            }
          })
          .catch((error) => res.status(500).json({ error }));
      }
    })
    .catch((error) => res.status(500).json({ error }));
};
