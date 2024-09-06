const multer = require('multer');

// Middleware pour gérer l'upload d'une image

// Dictionnaire de correspondance entre les mime_types et les extensions de fichiers image :
const MIME_TYPES = {
  'image/jpg': 'jpg',
  'image/jpeg': 'jpg',
  'image/png': 'png',
};

// Configuration du stockage des images
const storage = multer.diskStorage({
  // Configuration du dossier pour stocker les fichiers entrants
  destination: (req, file, callback) => {
    callback(null, 'images');
  },
  // Configuration du nom du fichier qui sera stocké dans le dossier
  filename: (req, file, callback) => {
    const name = file.originalname
      .replace(/ /g, '_')
      .split('.')
      .slice(0, -1)
      .join('_')
      .toString();
    const extension = MIME_TYPES[file.mimetype];
    callback(null, name + '_' + Date.now() + '.' + extension);
  },
});

module.exports = multer({ storage }).single('image');
