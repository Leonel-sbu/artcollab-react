import { app } from './firebaseConfig';
import {
    getFirestore,
    collection,
    doc,
    getDoc,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    serverTimestamp
} from 'firebase/firestore';

// Initialize Firestore
const db = getFirestore(app);

// Collections
export const USERS_COLLECTION = 'users';
export const ARTWORKS_COLLECTION = 'artworks';
export const COURSES_COLLECTION = 'courses';
export const ORDERS_COLLECTION = 'orders';
export const MESSAGES_COLLECTION = 'messages';

// User operations
export const createUserProfile = async (userId, userData) => {
    try {
        await setDoc(doc(db, USERS_COLLECTION, userId), {
            ...userData,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            role: 'user', // default role
            status: 'active'
        });
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const getUserProfile = async (userId) => {
    try {
        const docRef = doc(db, USERS_COLLECTION, userId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return { success: true, data: docSnap.data() };
        } else {
            return { success: false, error: 'User not found' };
        }
    } catch (error) {
        return { success: false, error: error.message };
    }
};

// Artwork operations
export const getArtworks = async (filters = {}) => {
    try {
        let q = query(collection(db, ARTWORKS_COLLECTION));

        // Apply filters if provided
        if (filters.category) {
            q = query(q, where('category', '==', filters.category));
        }

        if (filters.minPrice && filters.maxPrice) {
            q = query(q, where('price', '>=', filters.minPrice));
            q = query(q, where('price', '<=', filters.maxPrice));
        }

        q = query(q, orderBy('createdAt', 'desc'));

        const querySnapshot = await getDocs(q);
        const artworks = [];

        querySnapshot.forEach((doc) => {
            artworks.push({ id: doc.id, ...doc.data() });
        });

        return { success: true, data: artworks };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const getArtworkById = async (artworkId) => {
    try {
        const docRef = doc(db, ARTWORKS_COLLECTION, artworkId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return { success: true, data: { id: docSnap.id, ...docSnap.data() } };
        } else {
            return { success: false, error: 'Artwork not found' };
        }
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const createArtwork = async (artworkData, userId) => {
    try {
        const docRef = await addDoc(collection(db, ARTWORKS_COLLECTION), {
            ...artworkData,
            artistId: userId,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            status: 'available',
            likes: 0,
            views: 0
        });

        return { success: true, id: docRef.id };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

// Export db for direct use
export { db, collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, serverTimestamp };