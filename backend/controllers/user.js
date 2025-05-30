const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();


exports.signup = (req, res, next) => {
    User.findOne({ email: req.body.email })
        .then(user => {
            if (!user){
                bcrypt.hash(req.body.password, 10)
                .then(hash => {
                    const user = new User({
                        email: req.body.email,
                        password: hash
                    });
                    user.save()
                    .then(() => res.status(201).json({ message: 'Utilisateur créé !' }))
                    .catch(error => res.status(400).json({ error }));
                })
                .catch(error => res.status(500).json({ error }));
            }else{
                res.status(401).json({ error: 'Identifiant déjà utilisé' });
            }})
        };

exports.login = (req, res, next) => {
    User.findOne({ email: req.body.email })
        .then(user => {
            if (user === null) {
                res.status(401).json({ error: 'Identifiant et/ou mot de passe incorrect' });
            } else {
                bcrypt.compare(req.body.password, user.password)
                    .then(valid => {
                        if (!valid) {
                            res.status(401).json({ error: 'Identifiant et/ou mot de passe incorrect' });
                        } else {
                            res.status(200).json({
                                userId: user._id,
                                token: jwt.sign(
                                    { userId: user._id },
                                    process.env.JWT_SECRET,
                                    { expiresIn: '24h' })
                            });
                        }
                    })
                    .catch(error =>
                        res.status(500).json({ error }))
            }
        })
        .catch(error =>
            res.status(500).json({ error }))
};