const Book = require('../models/Book');
const fs = require('fs');

exports.createBook = (req, res, next) => {
    const bookObject = JSON.parse(req.body.book);
    delete bookObject._id;
    delete bookObject._userId;
    const book = new Book({
        ...bookObject,
        userId: req.auth.userId,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    });
    
    book.save()
    .then(() => { res.status(201).json({message: 'Livre enregistré !'})})
    .catch(error => { res.status(400).json( { error })})
};

exports.modifyBook = (req, res, next) => {
    const bookObject = req.file ? {
        ...JSON.parse(req.body.book),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body };

    delete bookObject._userId;
    Book.findOne({_id: req.params.id})
        .then((book) => {
            if (book.userId != req.auth.userId) {
                res.status(401).json({ message : 'Non-autorisé'});
            } else {
                Book.updateOne({ _id: req.params.id}, { ...bookObject, _id: req.params.id})
                .then(() => res.status(200).json({message: 'Livre modifié !'}))
                .catch(error => res.status(401).json({ error }));
            }
        })
        .catch((error) => {
            res.status(400).json({ error });
        });
};


exports.deleteBook = (req, res, next) => {
    Book.findOne({ _id: req.params.id})
        .then(book => {
            if (book.userId != req.auth.userId) {
                res.status(401).json({message: 'Non-autorisé'});
            } else {
                const filename = book.imageUrl.split('/images/')[1];
                fs.unlink(`images/${filename}`, () => {
                    Book.deleteOne({_id: req.params.id})
                    .then(() => { res.status(200).json({message: 'Livre supprimé !'})})
                    .catch(error => res.status(401).json({ error }));
                });
            }
        })
        .catch( error => res.status(500).json({ error }));
};


exports.getOneBook = (req, res, next) => {
    Book.findOne({ _id: req.params.id })
    .then(book => res.status(200).json(book))
    .catch(error => res.status(404).json({ error}));
};


exports.getAllBook = (req, res, next) => {
    Book.find()
    .then(books => res.status(200).json(books))
    .catch(error => res.status(400).json({ error }));
  };


exports.getBestRatedBooks  =  (req, res, next) => {
    Book.find()
      .sort({ averageRating: -1 })
      .limit(3)
      .then(books => res.status(200).json(books))
      .catch(error => res.status(404).json({ error: "Error getting best rating" }));
  };


exports.createRating = async (req, res) => {
    const { rating } = req.body;
    const { userId } = req.auth;
    const bookId = req.params.id;
  
    if (rating < 0 || rating > 5) {
      return res.status(400).json({ message: "Please rate the book from 1 to 5" });
    }
  
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }
  
    const hasUserRatedBook = book.ratings.some(rating => rating.userId === userId);
    if (hasUserRatedBook) {
      return res.status(403).json({ message: "Not authorized" });
    }
  
    book.ratings.push({ ...req.body, grade: rating });
    book.averageRating = (book.ratings.reduce((sum, rating) => sum + rating.grade, 0) / book.ratings.length).toFixed(1);
  
    try {
      await book.save();
      return res.status(201).json(book);
    } catch (error) {
      return res.status(500).json({ error: "Error while rating the book" });
    }
  };