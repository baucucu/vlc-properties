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
    addDoc,
    deleteDoc
} from "firebase/firestore";

// import { google } from 'googleapis'


const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    scopes: [
        'https://www.googleapis.com/auth/drive.file',
        'https://www.googleapis.com/auth/gmail.send',
    ],
    discoveryDocs: [
        'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest',
        'https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest',
    ]
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
// const analytics = getAnalytics(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('https://www.googleapis.com/auth/drive.file');
googleProvider.addScope('https://www.googleapis.com/auth/gmail.send');
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
const getDocumentOnce = async ({ collectionName, id }) => {
    console.log({ collectionName, id })
    const docRef = doc(db, collectionName, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        return docSnap.data()
    } else {
        return null
    }
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

async function deleteOne(collectionName, id) {
    const ref = doc(db, collectionName, id)
    return await deleteDoc(ref)
}

export {
    // analytics,
    auth,
    db,
    signInWithGoogle,
    logout,
    getRecords,
    updateOne,
    createOne,
    deleteOne,
    getDocumentOnce
};
export default app