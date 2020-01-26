const functions = require('firebase-functions');
const app = require('express')();
const FBAuth = require('./utility/fbAuth');
const { getAllScreams, postOneScream,getScream ,postComment,likeScream,unlikeScream,deleteScream} = require('./handlers/screams');
const { signup, login,uploadImage,addUserDetails,getUserDetails } = require('./handlers/users');
const {db} =require('./utility/admin');



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
app.get('/scream/:screamId/like',FBAuth,likeScream);
app.get('/scream/:screamId/unlike',FBAuth,unlikeScream);
app.delete('/scream/:screamId/delete',FBAuth,deleteScream);

exports.api = functions.https.onRequest(app);

exports.createNotificationOnLike = functions
  .region('us-central1')
  .firestore.document('likes/{id}')
  .onCreate((snapshot) => {
    return db
      .doc(`/screams/${snapshot.data().screamId}`)
      .get()
      .then((doc) => {
        if (
          doc.exists &&
          doc.data().userHandle !== snapshot.data().userHandle
        ) {
          return db.doc(`/notifications/${snapshot.id}`).set({
            createdAt: new Date().toISOString(),
            recipient: doc.data().userHandle,
            sender: snapshot.data().userHandle,
            type: 'like',
            read: false,
            screamId: doc.id
          });
        }
      })
      .catch((err) => console.error(err));
  });
exports.deleteNotificationOnUnLike = functions
  .region('us-central1')
  .firestore.document('likes/{id}')
  .onDelete((snapshot) => {
    return db
      .doc(`/notifications/${snapshot.id}`)
      .delete()
      .then(()=>{
          return;
      })
      .catch((err) => {
        console.error(err);
        return;
      });
  });
exports.createNotificationOnComment = functions
  .region('us-central1')
  .firestore.document('comments/{id}')
  .onCreate((snapshot) => {
    return db
      .doc(`/screams/${snapshot.data().screamId}`)
      .get()
      .then((doc) => {
        if (
          doc.exists &&
          doc.data().userHandle !== snapshot.data().userHandle
        ) {
          return db.doc(`/notifications/${snapshot.id}`).set({
            createdAt: new Date().toISOString(),
            recipient: doc.data().userHandle,
            sender: snapshot.data().userHandle,
            type: 'comment',
            read: false,
            screamId: doc.id
          });
        }
      })
      .catch((err) => {
        console.error(err);
        return;
      });
  });