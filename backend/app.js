const express = require('express');
const app = express();
app.use(express.json());

const Book = require('./models/Book');
const User = require('./models/User');

const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://luciemarche:Loksdu489tn!@monvieuxgrimoire.unq6ero.mongodb.net/?retryWrites=true&w=majority&appName=MonVieuxGrimoire',
    {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
});

app.get('/api/books', (req, res) => {
    Book.find()
        .then(books => {
            res.status(200).json(books);
        })
        .catch(error => res.status(400).json({ error }));
});

app.post('/api/books', (req, res) => {
    const book = new Book({
        ...req.body,
    });
    book.save()
        .then(() => res.status(201).json({ message: 'Book created' }))
        .catch(error => res.status(400).json({ error }));
});

app.post('/api/auth/signup', (req, res) => {
    // delete req.body._id;
    const user = new User({
        ...req.body
    });
    user.save()
        .then(() => res.status(201).json({ message: 'User created' }))
        .catch(error => res.status(400).json({ error }));
});

app.post('/api/auth/signin', (req, res) => {
    User.findOne({ email: req.body.email })
        .then(user => {
            if (!user) {
                return res.status(401).json({ error: 'User not found' });
            }
            if (user.password !== req.body.password) {
                return res.status(401).json({ error: 'Incorrect password' });
            }
            res.status(200).json({
                userId: user._id,
                token: 'TOKEN',
            });
        })
        .catch(error => res.status(500).json({ error }));
});

app.get('/api/books/:id', (req, res) => {
    Book.findOne( { _id: req.params.id } )
        .then(book => res.status(200).json(book))
        .catch(error => res.status(500).json({ error }));
});

app.put('/api/books/:id', (req, res) => {
    Book.updateOne({ _id: req.params.id }, { ...req.body, _id: req.params.id })
        .then(() => res.status(200).json({ message: 'Book updated' }))
        .catch(error => res.status(400).json({ error }));
});

app.delete('/api/books/:id', (req, res) => {
    Book.deleteOne({ _id: req.params.id })
        .then(() => res.status(200).json({ message: 'Book deleted' }))
        .catch(error => res.status(400).json({ error }));
});

module.exports = app;