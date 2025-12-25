const { initializeApp } = require("firebase/app");
const { getFirestore } = require("firebase/firestore");

const firebaseConfig = {
    apiKey: "AIzaSyDo58NCa9U7QCaTuGcLRbykXlDmNjXp0fA",
    authDomain: "new-event-e2a38.firebaseapp.com",
    projectId: "new-event-e2a38",
    storageBucket: "new-event-e2a38.firebasestorage.app",
    messagingSenderId: "598259162044",
    appId: "1:598259162044:web:792f128e63a59f86b6a9b9",
    measurementId: "G-GSNG6W9J9G"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

module.exports = { db };
