const multer = require("multer");

const sharp = require("sharp");

const path = require("path");

const fs = require("fs");

// storage configuration
const storage = multer.diskStorage({
  
  destination: (req, file, callback) => {
    callback(null, "images");
  },
  
  filename: (req, file, cb) => {
    const name = file.originalname.slice(0, 3);
    cb(null, name + Date.now() + ".webp");
  },
});

// file filter
const fileFilter = (req, file, callback) => {
  !file.originalname.match(/\.(jpg|jpeg|png|webp)$/)
    ? callback(
        new Error("Seulement JPG, JPEG, PNG et WEBP sont authorisés !"),
        false
      )
    : callback(null, true);
};


if (!fs.existsSync("images")) {
  fs.mkdirSync("images");
}

// Multer configuration
const upload = multer({ storage: storage, fileFilter: fileFilter }).single(
  "image"
);

module.exports = upload;

module.exports.optimizeImage = (req, res, next) => {
  if (!req.file) {
    return next();
  }

  const filePath = req.file.path;
  const fileName = req.file.filename;
  const outputFilePath = path.join("images", `resized_${fileName}`);

  // Image optimization with sharp
  sharp.cache(false);
  sharp(filePath)
    .resize({ width: 206, height: 260 })
    .toFile(outputFilePath)
    .then(() => {
      console.log(`Image ${fileName} Successfully optimized`);

      fs.unlink(filePath, () => {
        req.file.path = outputFilePath;
        console.log(
          ` ${fileName} Image supprimée avec succès `
        );
        next();
      });
    })
    .catch((err) => {
      console.log(err);
      return next();
    });
};