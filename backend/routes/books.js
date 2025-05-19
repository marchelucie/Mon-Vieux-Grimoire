const express = require('express');
const router = express.Router();

const Book = require('../models/Book');

router.get('/', (req, res, next) => {
    Book.find()
        .then(books => {
            res.status(200).json(books);
        })
        .catch(error => res.status(400).json({ error }));
});

router.post('/', (req, res, next) => {
    const book = new Book({
        ...req.body,
    });
    book.save()
        .then(() => res.status(201).json({ message: 'Book created' }))
        .catch(error => res.status(400).json({ error }));
});

router.get('/:id', (req, res, next) => {
    Book.findOne( { _id: req.params.id } )
        .then(book => res.status(200).json(book))
        .catch(error => res.status(500).json({ error }));
});

router.put('/:id', (req, res, next) => {
    Book.updateOne({ _id: req.params.id }, { ...req.body, _id: req.params.id })
        .then(() => res.status(200).json({ message: 'Book updated' }))
        .catch(error => res.status(400).json({ error }));
});

router.delete('/:id', (req, res, next) => {
    Book.deleteOne({ _id: req.params.id })
        .then(() => res.status(200).json({ message: 'Book deleted' }))
        .catch(error => res.status(400).json({ error }));
});

module.exports = router;