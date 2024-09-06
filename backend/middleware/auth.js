const jwt = require('jsonwebtoken');
const dotenv = require('dotenv').config();

// Extraction des infos transmises dans le token pour vérifier leur validité + transmission aux autres middlewares ou au gestionnaire de routes
module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1]; // Extraction du token du header 'Authorization' : split autour de l'espace entre 'Bearer' et le token, et récupération de la deuxième partie, càd le token
    const decodedToken = jwt.verify(token, process.env.SECRET_KEY); // Décodage du token avec la clé secrète
    const userId = decodedToken.userId; // Extraction de la valeur de la propriété 'userId' du token décodé
    req.auth = {
      // Ajout de cet userId à l'objet 'request' qui est transmis aux routes appelées par la suite. Création de l'objet 'auth' dans 'req'
      userId: userId,
    };
    next();
  } catch (error) {
    res.status(401).json({ error }); // Unauthaurized
  }
};
