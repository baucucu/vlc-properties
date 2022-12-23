// Import the functions you need from the SDKs you need
import store from '../js/store';
import { initializeApp } from "firebase/app";
import {
    GoogleAuthProvider,
    getAuth,
    signInWithPopup,
    signOut,
} from "firebase/auth";
import {
    getFirestore,
    query,
    getDoc,
    getDocs,
    collection,
    where,
    setDoc,
    doc,
    onSnapshot,
    updateDoc,
    addDoc
} from "firebase/firestore";

// import { google } from 'googleapis'
// const drive = google.drive('v3');

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('https://www.googleapis.com/auth/drive.file');
googleProvider.addScope('https://www.googleapis.com/auth/gmail.send')
const signInWithGoogle = async () => {
    try {
        const res = await signInWithPopup(auth, googleProvider);
        const user = res.user;
        // const q = query(collection(db, "users"), where("uid", "==", user.uid));
        const usersRef = doc(db, 'users', user.uid)
        await setDoc(usersRef, {
            id: user.id,
            // uid: user.uid,
            name: user.displayName,
            authProvider: "google",
            email: user.email,
        }, {
            merge: true
        });
    } catch (err) {
        console.error({ err });
    }
};

const logout = () => {
    signOut(auth);
};

const getRecords = (collectionName) => {
    const q = query(collection(db, collectionName))
    try {
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const docs = []
            querySnapshot.forEach((doc) => {
                docs.push({ ...doc.data(), id: doc.id });
            });
            store.dispatch('setData', { collectionName, docs })
        });
    } catch (e) { console.log({ e }) }
}

async function updateOne({ collectionName, id, payload }) {
    console.log({ saving: { collectionName, id, payload } })
    const ref = doc(db, collectionName, id)
    await updateDoc(ref, payload);
}

async function createOne(collectionName, payload) {
    console.log({ received: payload })
    const ref = doc(collection(db, collectionName))
    const created = await setDoc(ref, payload)
    return ref.id

}



export {
    // analytics,
    auth,
    db,
    signInWithGoogle,
    logout,
    getRecords,
    updateOne,
    createOne
};
export default app