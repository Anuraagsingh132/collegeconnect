import { Client, Account, Databases, Storage, Teams, ID } from 'appwrite';
import { 
    APPWRITE_ENDPOINT,
    APPWRITE_PROJECT_ID,
    APPWRITE_DATABASE_ID
} from './config';

// Initialize the Appwrite client
export const client = new Client();

client
    .setEndpoint(APPWRITE_ENDPOINT)
    .setProject(APPWRITE_PROJECT_ID);

// Initialize Appwrite services
export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
export const teams = new Teams(client);

// Authentication functions
export const signUp = async (email: string, password: string, name: string) => {
    try {
        // Create a new user with a unique ID
        const user = await account.create(ID.unique(), email, password, name);
        // Automatically sign in after registration using the correct method
        await signIn(email, password);
        return { data: user, error: null };
    } catch (error) {
        console.error('Error in signUp:', error);
        return { data: null, error };
    }
};

export const signIn = async (email: string, password: string) => {
    try {
        // Use the correct method for Appwrite v1.5+
        const session = await account.createEmailPasswordSession(email, password);
        return { data: session, error: null };
    } catch (error) {
        console.error('Error in signIn:', error);
        return { data: null, error };
    }
};

export const signInWithGoogle = async () => {
    try {
        // Updated to use correct method and ensure proper redirects
        const session = await account.createOAuth2Session(
            'google' as any, // Type assertion needed for Appwrite SDK's type definitions
            `${window.location.origin}/explore`, // Success URL
            `${window.location.origin}/signin`   // Failure URL
        );
        return { data: session, error: null };
    } catch (error) {
        console.error('Error in signInWithGoogle:', error);
        return { data: null, error };
    }
};

export const signOut = async () => {
    try {
        await account.deleteSession('current');
        return { error: null };
    } catch (error) {
        console.error('Error in signOut:', error);
        return { error };
    }
};

export const getCurrentUser = async () => {
    try {
        const user = await account.get();
        return { data: user, error: null };
    } catch (error) {
        console.error('Error in getCurrentUser:', error);
        return { data: null, error };
    }
};

// Storage functions
export const uploadImage = async (file: File, bucketId: string) => {
    try {
        const response = await storage.createFile(bucketId, ID.unique(), file);
        return { data: response, error: null };
    } catch (error) {
        console.error('Error in uploadImage:', error);
        return { data: null, error };
    }
};

export const getImageUrl = (bucketId: string, fileId: string) => {
    return storage.getFileView(bucketId, fileId);
};

// Database functions
export const createDocument = async (collectionId: string, data: any) => {
    try {
        const document = await databases.createDocument(
            APPWRITE_DATABASE_ID,
            collectionId,
            ID.unique(),
            data
        );
        return { data: document, error: null };
    } catch (error) {
        console.error('Error in createDocument:', error);
        return { data: null, error };
    }
};

export const updateDocument = async (collectionId: string, documentId: string, data: any) => {
    try {
        const document = await databases.updateDocument(
            APPWRITE_DATABASE_ID,
            collectionId,
            documentId,
            data
        );
        return { data: document, error: null };
    } catch (error) {
        console.error('Error in updateDocument:', error);
        return { data: null, error };
    }
};

export const deleteDocument = async (collectionId: string, documentId: string) => {
    try {
        await databases.deleteDocument(
            APPWRITE_DATABASE_ID,
            collectionId,
            documentId
        );
        return { error: null };
    } catch (error) {
        console.error('Error in deleteDocument:', error);
        return { error };
    }
};

export const listDocuments = async (collectionId: string, queries: any[] = []) => {
    try {
        const documents = await databases.listDocuments(
            APPWRITE_DATABASE_ID,
            collectionId,
            queries
        );
        return { data: documents, error: null };
    } catch (error) {
        console.error('Error in listDocuments:', error);
        return { data: null, error };
    }
}; 