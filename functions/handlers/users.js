const { db, admin } = require('../utility/admin');
const Config = require('../utility/config');
const firebase = require('firebase');
firebase.initializeApp(Config);

exports.signup = (req, res) => {
    const noImg = '9188.jpg';
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
                imageUrl: `https://firebasestorage.googleapis.com/v0/b/${
                    Config.storageBucket
                    }/o/${noImg}?alt=media`,
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
exports.login = (req, res) => {

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
exports.uploadImage = (req, res) => {
    const BusBoy = require('busboy');
    const path = require('path');
    const os = require('os');
    const fs = require('fs');

    const busboy = new BusBoy({ headers: req.headers });

    let imageToBeUploaded = {};
    let imageFileName;

    busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
        console.log(fieldname, file, filename, encoding, mimetype);
        if (mimetype !== 'image/jpeg' && mimetype !== 'image/png') {
            return res.status(400).json({ error: 'Wrong file type submitted' });
        }
        // my.image.png => ['my', 'image', 'png']
        const imageExtension = filename.split('.')[filename.split('.').length - 1];
        // 32756238461724837.png
        imageFileName = `${Math.round(
            Math.random() * 1000000000000
        ).toString()}.${imageExtension}`;
        const filepath = path.join(os.tmpdir(), imageFileName);
        imageToBeUploaded = { filepath, mimetype };
        file.pipe(fs.createWriteStream(filepath));
    });
    busboy.on('finish', () => {
        admin
            .storage()
            .bucket()
            .upload(imageToBeUploaded.filepath, {
                resumable: false,
                metadata: {
                    metadata: {
                        contentType: imageToBeUploaded.mimetype
                    }
                }
            })
            .then(() => {
                const imageUrl = `https://firebasestorage.googleapis.com/v0/b/${
                    Config.storageBucket
                    }/o/${imageFileName}?alt=media`;
                return db.doc(`/users/${req.user.handle}`).update({ imageUrl });
            })
            .then(() => {
                return res.json({ message: 'image uploaded successfully' });
            })
            .catch((err) => {
                console.error(err);
                return res.status(500).json({ error: 'something went wrong' });
            });
    });
    busboy.end(req.rawBody);
};
exports.addUserDetails= (req,res)=>{
    const userDetails={};
    userDetails.bio=req.body.bio;
    userDetails.location=req.body.location;

    return db.doc(`/users/${req.user.handle}`).update(userDetails)
    .then(()=>{
        return res.status(201).json("userDetails uploaded successfully ")
    })
    .catch(err=>{
        console.error(err);
        return res.status(404).json(
            {error:err.code}
        );
    });


};
exports.getUserDetails=(req,res)=>{
    let userData={};
    db.doc(`/users/${req.user.handle}`).get()
    .then(doc=>{
        if(doc.exists){
        userData.credentials=doc.data();

        return db.collection('likes').where('userHandle','==',req.user.handle).get()
        }
    })
    .then(data=>{
        userData.likes= [];
        data.forEach(doc=>{
            userData.likes.push(doc.data());
        });
        return res.json(userData);
    })
    .catch(err=>{

        console.error(err);
        return res.status(500).json({error:err.code});
    })
};