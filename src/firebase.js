const { initializeApp } = require("firebase/app");
const { getFirestore, collection, doc, getDocs, updateDoc } = require("firebase/firestore/lite");


const firebaseConfig = {
    apiKey: process.env.API_KEY,
    authDomain: process.env.AUTH_DOMAIN,
    databaseURL: process.env.DATABASE_URL,
    projectId: process.env.PROJECT_ID,
    storageBucket: process.env.STORAGE_BUCKET,
    messagingSenderId: process.env.MESSAGING_SENDER_ID,
    appId: process.env.APP_ID
};

const app = initializeApp(firebaseConfig);
const database = getFirestore(app);

async function getID() {
    const idCol = collection(database, 'lastTweet');
    const data = (await getDocs(idCol)).docs.map(doc => doc.data())[0];
    return data.id;
}

async function updateID(newID) {
    const idCol = collection(database, 'lastTweet')
    const data = (await getDocs(idCol)).docs.map(doc => doc.ref)[0];
    await updateDoc(data, { id: newID });
    return;
}

module.exports = { getID, updateID };
