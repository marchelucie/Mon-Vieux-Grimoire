const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const optimizeImage = async (req, res, next) => {
  if (!req.file) return next();

  const inputPath = req.file.path;
  const outputFilename = `${req.file.filename}.webp`;
  const outputPath = path.join('images', 'optimized', outputFilename);

  try {
    await sharp(inputPath)
      .resize({ width: 360 })
      .toFormat('webp', { quality: 80 })
      .toFile(outputPath);

    fs.unlink(inputPath, (err) => {
      if (err) console.error('Erreur suppression fichier original :', err);
    });

    req.file.filename = outputFilename;
    req.file.path = outputPath;
    next();
  } catch (error) {
    console.error('Erreur optimisation image :', error);
    res.status(500).json({ error: 'Échec de l’optimisation de l’image' });
  }
};

module.exports = optimizeImage;
