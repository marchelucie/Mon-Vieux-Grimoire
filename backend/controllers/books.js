const Book = require('../models/Book');
const fs = require('fs');

exports.createBook = (req, res, next) => {
    const bookObject = JSON.parse(req.body.book);
    delete bookObject._id;
    delete bookObject._userId;

    const ratings = bookObject.ratings.map(rating => ({
        grade: rating.grade
    }));
    const averageRating = ratings.length > 0
        ? ratings.reduce((acc, rating) => acc + rating.grade, 0) / ratings.length
        : 0;


    const book = new Book({
        ...bookObject,
        userId: req.auth.userId,
        imageUrl: `${req.protocol}://${req.get('host')}/images/optimized/${req.file.filename}`,
        averageRating
    });

    book.save()
        .then(() => res.status(201).json({ message: 'Livre créé !' }))
        .catch(error => res.status(400).json({ error }));
};


exports.getAllBooks = (req, res, next) => {
    Book.find()
        .then(books => {
            res.status(200).json(books);
        })
        .catch(error => res.status(400).json({ error }));
};

exports.getOneBook = (req, res, next) => {
    Book.findOne({ _id: req.params.id })
        .then(book => res.status(200).json(book))
        .catch(error => res.status(500).json({ error }));
};


exports.modifyBook = (req, res, next) => {
    const bookObject = req.file ? {
        ...JSON.parse(req.body.book),
        imageUrl: `${req.protocol}://${req.get('host')}/images/optimized/${req.file.filename}`,
    } : { ...req.body };
    delete bookObject._userId;
    Book.findOne({ _id: req.params.id })
        .then((book) => {
            if (book.userId !== req.auth.userId) {
                res.status(401).json({ message: 'Not authorized' });
            } else {
                Book.updateOne({ _id: req.params.id }, { ...bookObject, _id: req.params.id })
                    .then(() => res.status(200).json({ message: 'Livre modifié !' }))
                    .catch(error => res.status(401).json({ error }));
            }
        })
        .catch(error => res.status(400).json({ error }));
};

exports.deleteBook = (req, res, next) => {
    Book.findOne({ _id: req.params.id })
        .then(book => {
            if (book.userId != req.auth.userId) {
                res.status(401).json({ message: 'Not authorized' });
            } else {
                const filename = book.imageUrl.split('/images/')[1];
                const originalImagePath = `images/${filename}`;
                const optimizedImagePath = `images/optimized/${filename}`;
                fs.unlink(optimizedImagePath, () => {
                    fs.unlink(originalImagePath, () => {
                    Book.deleteOne({ _id: req.params.id })
                        .then(() => res.status(200).json({ message: 'Livre supprimé !' }))
                        .catch(error => res.status(401).json({ error }));
                })});
            }
        })
        .catch(error => res.status(500).json({ error }));
};

exports.rateBook = (req, res, next) => {
    Book.findOne({ _id: req.params.id })
        .then(book => {
            if (!book) {
                return res.status(404).json({ message: 'Livre non trouvé' });
            }

            const userId = req.auth.userId;
            const grade = req.body.rating;

            // Vérifier si l'utilisateur a déjà noté le livre
            const existingRatingIndex = book.ratings.findIndex(rating => rating.userId === userId);

            if (existingRatingIndex !== -1) {
                return res.status(401).json({ message: 'Vous avez déjà noté ce livre' });
            }

            book.ratings.push({ userId, grade }); // Ajoute une nouvelle note

            // Calculer la nouvelle note moyenne
            const averageRating = book.ratings.reduce((acc, rating) => acc + rating.grade, 0) / book.ratings.length;

            // Mettre à jour la note moyenne du livre
            book.averageRating = averageRating;

            book.save()
                .then(() => res.status(200).json(book))
                .catch(error => res.status(400).json({ error }));
        })
        .catch(error => res.status(500).json({ error }));
}

exports.bestRatedBooks = (req, res, next) => {
    Book.find()
        .then(books => {
            if (books.length === 0) {
                return res.status(404).json({ message: 'Aucun livre trouvé' });
            } else {
                const bestRatedBooks = books
                    .filter(book => book.averageRating > 0)
                    .sort((a, b) => b.averageRating - a.averageRating)
                    .slice(0, 3); // Limite à 3 livres les mieux notés
                res.status(200).json(bestRatedBooks);
            };
        })
        .catch(error => res.status(400).json({ error }));
}