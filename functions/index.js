const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();
var Config = {
    apiKey: "AIzaSyBAg9S9dHUVt407ODU-KTtwlDHjsLyE6Gw",
    authDomain: "socialapp-fbfd0.firebaseapp.com",
    databaseURL: "https://socialapp-fbfd0.firebaseio.com",
    projectId: "socialapp-fbfd0",
    storageBucket: "socialapp-fbfd0.appspot.com",
    messagingSenderId: "1016911732922",
    appId: "1:1016911732922:web:39daedb29eab9578b8a283",
    measurementId: "G-WVPND932GB"
};
const firebase = require('firebase');
firebase.initializeApp(Config)

const express = require('express');
const app = express();

app.get('/screams', (req, res) => {
    admin
        .firestore()
        .collection('screams')
        .orderBy('createdAt', 'desc')
        .get()
        .then(data => {
            let screams = [];

            data.forEach(doc => {
                screams.push({
                    screamId: doc.id,
                    body: doc.data().body,
                    userHandle: doc.data().userHandle,
                    createdAt: doc.data().createdAt

                });

            });
            return res.json(screams);
        })
        .catch(err => {
            console.log(err);
        })

});
app.post('/scream', (req, res) => {
    const newScream = {
        body: req.body.body,
        userHandle: req.body.userHandle,
        createdAt: new Date().toISOString()
    };

    admin.firestore()
        .collection('screams')
        .add(newScream)
        .then(doc => {

            res.json({ message: `document ${doc.id} created succesfully` });
        })
        .catch(err => {
            res.status(500).json({ error: `Something went wrong` });
            console.log(err);
        })

});
app.post('/signup', (req, res) => {
    const newUser = {
        email: req.body.email,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword,
        handle: req.body.handle
    };
    firebase.auth().createUserWithEmailAndPassword(newUser.email,newUser.password)
    .then((data)=>{
        res.status(200)
        .json({message:`user ${data.user.uid} signed up successfully`});
    })
        .catch((err)=>{
            console.log(err);
            return res.json("some error occured");
        });
        

});

exports.api = functions.https.onRequest(app);