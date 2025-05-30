const validator = require('validator');

module.exports = (req, res, next) => {
    if (!validator.isEmail(req.body.email)) {
        return res.status(400).json({ message: "Email invalide" });
    };

    const password = req.body.password;
    const passwordIsValid = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(password);

    if (!passwordIsValid) {
        return res.status(400).json({ message: "Mot de passe trop faible (8 caractères, majuscule, minuscule, chiffre)" });
    };

    next();
};