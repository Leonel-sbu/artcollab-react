const admin = require("firebase-admin");
const db = admin.firestore();

const collection = db.collection("users");

module.exports = collection;
