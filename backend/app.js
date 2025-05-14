const express = require('express');
const app = express();
app.use(express.json());

const Book = require('./models/Book');

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

app.get('/api/books', (req, res, next) => {
    const books = [
        {
            id: 1,
            title: 'Le Petit Prince',
            imageUrl: 'https://m.media-amazon.com/images/I/71IF1ngy57L._AC_UF1000,1000_QL80_.jpg',
            averageRating: 4.5,
            author: 'Antoine de Saint-Exupéry',
            year: 1943,
            genre: 'Fiction',
        },
        {
            id: 2,
            title: '1984',
            imageUrl: 'https://m.media-amazon.com/images/I/7180qjGSgDL._AC_UF1000,1000_QL80_.jpg',
            averageRating: 4.7,
            author: 'George Orwell',
            year: 1949,
            genre: 'Dystopian',
        },
        {
            id: 3,
            title: 'To Kill a Mockingbird',
            imageUrl: 'https://m.media-amazon.com/images/I/81gepf1eMqL._AC_UF1000,1000_QL80_.jpg',
            averageRating: 4.8,
            author: 'Harper Lee',
            year: 1960,
            genre: 'Fiction',
        },
    ];
    res.status(200).json(books);
    next();
});

app.post('/api/books', (req, res, next) => {
    const book = new Book({
        ...req.body,
    });
    book.save()
        .then(() => res.status(201).json({ message: 'Book created' }))
        .catch(error => res.status(400).json({ error }));
    next();
});

// app.post('/api/auth/signup', (req, res, next) => {
//     delete req.body._id;
//     const user = new User({
//         ..req.body
//     });
//     user.save()
//         .then(() => res.status(201).json({ message: 'User created' }))
//         .catch(error => res.status(400).json({ error }));
//     next();
// });

// app.get('/api/auth/signin', (req, res, next) => {
//     User.find({ email: req.body.email })
//         .then(user => {
//             if (!user) {
//                 return res.status(401).json({ error: 'User not found' });
//             }
//             if (user.password !== req.body.password) {
//                 return res.status(401).json({ error: 'Incorrect password' });
//             }
//             res.status(200).json({
//                 userId: user._id,
//                 token: 'TOKEN',
//             });
//         })
//         .catch(error => res.status(500).json({ error }));
//     next();
// }
// );

module.exports = app;