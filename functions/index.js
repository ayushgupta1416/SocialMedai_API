const functions = require('firebase-functions');
const app = require('express')();
const FBAuth = require('./utility/fbAuth');
const { getAllScreams, postOneScream,getScream ,postComment,likeScream} = require('./handlers/screams');
const { signup, login,uploadImage,addUserDetails,getUserDetails } = require('./handlers/users');



//Scream routes
app.get('/screams', getAllScreams);
app.post('/scream', FBAuth, postOneScream);

//user routes
app.get('/scream/:screamId', getScream);
app.post('/signup', signup);
app.post('/login', login);
app.post('/user/image',FBAuth ,uploadImage);
app.post('/user',FBAuth,addUserDetails);
app.get('/user',FBAuth,getUserDetails);
app.post('/scream/:screamId/comment',FBAuth,postComment);
app.get('/scream/:screamId/like',FBAuth,likeScream)
exports.api = functions.https.onRequest(app);