const Book = require('../models/Book');
const fs = require('fs');

// Controller to create a new book entry
exports.createBook = (req, res, next) => {
    // Parse the book object from the request body and remove unwanted fields
    const bookObject = JSON.parse(req.body.book);
    delete bookObject._id;
    delete bookObject._userId;

    // Extract ratings grades only, ignoring user IDs for initial calculation
    const ratings = bookObject.ratings.map(rating => ({
        grade: rating.grade
    }));
    // Compute the average rating: sum of grades divided by number of ratings
    const averageRating = ratings.length > 0
        ? ratings.reduce((acc, rating) => acc + rating.grade, 0) / ratings.length
        : 0;

    // Create a new Book instance with all necessary properties
    const book = new Book({
        ...bookObject,
        userId: req.auth.userId, // Set the owner of the book from authenticated user
        imageUrl: req.file && req.file.filename 
            // Build the image URL if a file was uploaded, otherwise null
            ? `${req.protocol}://${req.get('host')}/images/optimized/${req.file.filename}` 
            : null,
        averageRating // Store the computed average rating
    });

    // Save the book to the database
    book.save()
        .then(() => res.status(201).json({ message: 'Book created!' }))
        .catch(error => res.status(400).json({ error }));
};

// Controller to retrieve all books
exports.getAllBooks = (req, res, next) => {
    Book.find()
        .then(books => {
            // Return the list of books in JSON format
            res.status(200).json(books);
        })
        .catch(error => res.status(400).json({ error }));
};

// Controller to retrieve a single book by its ID
exports.getOneBook = (req, res, next) => {
    Book.findOne({ _id: req.params.id })
        .then(book => res.status(200).json(book))
        .catch(error => res.status(500).json({ error }));
};

// Controller to modify an existing book
exports.modifyBook = (req, res, next) => {
    let bookObject;
    if (req.file) {
        // If a new image file is uploaded, parse the book data and update imageUrl
        bookObject = {
            ...JSON.parse(req.body.book),
            imageUrl: `${req.protocol}://${req.get('host')}/images/optimized/${req.file.filename}`,
        };
    } else {
        // If no image is uploaded, take the request body as-is
        bookObject = { ...req.body };
    }
    // Remove fields that should not be modified manually
    delete bookObject._userId;
    delete bookObject.ratings;
    delete bookObject.averageRating;

    // Find the existing book document to verify ownership
    Book.findOne({ _id: req.params.id })
        .then(book => {
            // Check if the requesting user is the owner
            if (!book.userId || !req.auth.userId || book.userId !== req.auth.userId) {
                return res.status(401).json({ message: 'Not authorized' });
            }
            // Update the book with new data, ensuring the ID remains unchanged
            Book.updateOne({ _id: req.params.id }, { ...bookObject, _id: req.params.id })
                .then(() => {
                    res.status(200).json({ message: 'Book updated!' });
                })
                .catch(error => res.status(400).json({ error }));
        })
        .catch(error => res.status(400).json({ error }));
};

// Controller to delete a book and its associated images
exports.deleteBook = (req, res, next) => {
    Book.findOne({ _id: req.params.id })
        .then(book => {
            // Check if the requesting user is the owner
            if (book.userId != req.auth.userId) {
                return res.status(401).json({ message: 'Not authorized' });
            }
            // Extract the filename from the stored imageUrl
            const filename = book.imageUrl.split('/images/')[1];
            const originalImagePath = `images/${filename}`;
            const optimizedImagePath = `images/optimized/${filename}`;
            // Remove the optimized image file first
            fs.unlink(optimizedImagePath, () => {
                // Then remove the original uploaded image file
                fs.unlink(originalImagePath, () => {
                    // Finally, delete the book document from the database
                    Book.deleteOne({ _id: req.params.id })
                        .then(() => res.status(200).json({ message: 'Book deleted!' }))
                        .catch(error => res.status(401).json({ error }));
                });
            });
        })
        .catch(error => res.status(500).json({ error }));
};

// Controller to add a rating for a book
exports.rateBook = (req, res, next) => {
    Book.findOne({ _id: req.params.id })
        .then(book => {
            if (!book) {
                // If no book is found, return a 404 error
                return res.status(404).json({ message: 'Book not found' });
            }

            const userId = req.auth.userId;
            const grade = req.body.rating;

            // Check if the user has already rated this book
            const existingRatingIndex = book.ratings.findIndex(rating => rating.userId === userId);

            if (existingRatingIndex !== -1) {
                // If the user already rated, prevent duplicate ratings
                return res.status(401).json({ message: 'You have already rated this book' });
            }

            // Add the new rating (with userId and grade) to the book
            book.ratings.push({ userId, grade });

            // Recompute the average rating based on all ratings
            const averageRating = book.ratings.reduce((acc, rating) => acc + rating.grade, 0) / book.ratings.length;
            book.averageRating = averageRating;

            // Save the updated book document
            book.save()
                .then(() => res.status(200).json(book))
                .catch(error => res.status(400).json({ error }));
        })
        .catch(error => res.status(500).json({ error }));
};

// Controller to retrieve the top 3 best-rated books
exports.bestRatedBooks = (req, res, next) => {
    Book.find()
        .then(books => {
            if (books.length === 0) {
                // Return 404 if no books exist
                return res.status(404).json({ message: 'No books found' });
            } else {
                // Filter out books with no ratings (averageRating > 0), sort by averageRating descending
                const bestRatedBooks = books
                    .filter(book => book.averageRating > 0)
                    .sort((a, b) => b.averageRating - a.averageRating)
                    .slice(0, 3); // Take only the top 3 books
                res.status(200).json(bestRatedBooks);
            }
        })
        .catch(error => res.status(400).json({ error }));
};
