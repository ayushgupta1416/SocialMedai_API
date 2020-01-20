const {db} =require('../utility/admin');
const Config=require('../utility/config');
const firebase = require('firebase');
firebase.initializeApp(Config);

exports.signup= (req, res) => {

    let token, userId;
    const newUser = {
        email: req.body.email,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword,
        handle: req.body.handle
    };
    db.doc(`/users/${newUser.handle}`).get()
        .then(doc => {
            if (doc.exists) {
                return res.status(400).json({ handle: 'user with this handle already exsist' });
            }
            else {
                return firebase
                    .auth()
                    .createUserWithEmailAndPassword(newUser.email, newUser.password);
            }
        })

        .then((data) => {
            userId = data.user.uid;
            return data.user.getIdToken();
        })
        .then(idToken => {
            token = idToken;
            const userCredentials = {
                handle: newUser.handle,
                email: newUser.email,
                createdAt: new Date().toISOString(),
                userId
            };
            return db.doc(`/users/${newUser.handle}`).set(userCredentials);
        })
        .then(() => {
            return res.status(201).json({ token });
        })
        .catch((err) => {
            console.error(err);
            return res.status(500).json({
                error: err.code
            });
        });


};
exports.login=(req, res) => {

    let token, userId;
    const user = {
        email: req.body.email,
        password: req.body.password
    };
    firebase
        .auth().signInWithEmailAndPassword(user.email, user.password)

        .then((data) => {
            //userId = data.user.uid;
            return data.user.getIdToken();
        })

        .then((token) => {
            return res.status(201).json({ token });
        })
        .catch((err) => {
            console.error(err);
            if (err.code === 'auth/wrong-password') {
                return res.status(203).json({ general: 'wrong credentials please try again' });
            }
            return res.status(500).json({
                error: err.code
            });
        });


};