const fs = require('fs');
const sharp = require('sharp');

// Middleware pour optimiser une image uploadée

module.exports = (req, res, next) => {
  // Gestion du cas d'erreur où req.file n'existe pas (requête PUT sans mise à jour de l'image)
  if (!req.file) {
    return next();
  }

  // Vérification de l'existence du dossier 'images'. S'il n'existe pas, on le crée
  fs.access('images', (error) => {
    if (error) {
      fs.mkdirSync('images');
    }
  });

  // Configuration du nom du fichier formaté (fichier sortant)
  const { path, filename } = req.file;
  const name = filename.split('.').slice(0, -1).join('_');
  const newFilename = `resized_${name}.webp`;

  try {
    // Configuration de la qualité, du format et du chemin désirés pour le fichier formaté
    sharp.cache(false);
    sharp(path)
      .toFormat('webp', { quality: 80 })
      .resize({ width: 405, fit: sharp.fit.contain })
      .toFile(`images/${newFilename}`)
      .then(() => {
        fs.unlink(path, () => {
          req.file.filename = newFilename;
          next();
        });
      });
  } catch (error) {
    res.status(500).json({ error });
  }
};
