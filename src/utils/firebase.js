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

const getRecordById = async (collectionName, id) => {
    const ref = query(collection(db, collectionName, id))
    const docSnap = await getDoc(ref)
    if (docSnap.exists()) {
        console.log(docSnap.data())
    } else {
        console.log(`Document ${id} does not exist in collection ${collectionName}`)
    }
}

async function updateRecordById(collectionName, id, payload) {
    console.log({ received: { collectionName, id, payload } })
    const ref = doc(db, collectionName, id)
    await setDoc(ref, payload, { merge: true });
}

async function updateOne({ collectionName, id, payload }) {
    console.log({ saving: { collectionName, id, payload } })
    const ref = doc(db, collectionName, id)
    await updateDoc(ref, payload);
}

async function createOne(collectionName, payload) {
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