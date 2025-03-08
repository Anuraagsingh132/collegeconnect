import React, { createContext, useContext, useEffect, useState } from 'react';
import { account, databases, client } from './appwrite';
import { Models, Query, ID } from 'appwrite';
import { APPWRITE_DATABASE_ID, APPWRITE_PROFILES_COLLECTION_ID } from './config';
import { useToast } from '@/components/ui/use-toast';

interface AuthContextType {
    user: Models.User<Models.Preferences> | null;
    profile: any | null;
    loading: boolean;
    error: Error | null;
    signOut: () => Promise<void>;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    profile: null,
    loading: true,
    error: null,
    signOut: async () => {},
    refreshUser: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<Models.User<Models.Preferences> | null>(null);
    const [profile, setProfile] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const { toast } = useToast();

    // Fetch user profile or create if it doesn't exist
    const fetchProfile = async (userId: string) => {
        try {
            // Use Query to search for profile by user_id
            const response = await databases.listDocuments(
                APPWRITE_DATABASE_ID,
                APPWRITE_PROFILES_COLLECTION_ID,
                [
                    Query.equal('user_id', userId)
                ]
            );
            
            if (response.documents.length > 0) {
                setProfile(response.documents[0]);
            } else {
                // Create profile if it doesn't exist - with only fields that exist in the schema
                const newProfile = await databases.createDocument(
                    APPWRITE_DATABASE_ID,
                    APPWRITE_PROFILES_COLLECTION_ID,
                    ID.unique(),  // Use Appwrite ID generator for valid IDs
                    {
                        user_id: userId,
                        // Only include fields that are defined in your Appwrite collection schema
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                    }
                );
                setProfile(newProfile);
            }
        } catch (err: any) {
            console.error('Error fetching profile:', err);
            setError(new Error(err.message || 'Failed to fetch user profile'));
            toast({
                title: 'Error',
                description: 'Failed to fetch user profile: ' + (err.message || 'Unknown error'),
                variant: 'destructive',
            });
        }
    };

    // Refresh user and profile data
    const refreshUser = async () => {
        setLoading(true);
        try {
            const currentUser = await account.get();
            setUser(currentUser);
            await fetchProfile(currentUser.$id);
        } catch (err: any) {
            console.error('Error refreshing user:', err);
            setError(new Error(err.message || 'Failed to refresh user data'));
            toast({
                title: 'Error',
                description: 'Failed to refresh user data: ' + (err.message || 'Unknown error'),
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    // Check for existing session on mount
    useEffect(() => {
        const checkSession = async () => {
            try {
                const currentUser = await account.get();
                setUser(currentUser);
                await fetchProfile(currentUser.$id);
            } catch (err) {
                console.error('No active session:', err);
                setUser(null);
                setProfile(null);
            } finally {
                setLoading(false);
            }
        };

        checkSession();

        // Subscribe to auth changes
        const unsubscribe = client.subscribe('account', (response) => {
            console.log('Auth state changed:', response);
            if (response.events.includes('user.update') || response.events.includes('session.create')) {
                checkSession();
            } else if (response.events.includes('session.delete')) {
                setUser(null);
                setProfile(null);
            }
        });

        return () => {
            unsubscribe();
        };
    }, []);

    // Sign out function
    const signOut = async () => {
        try {
            await account.deleteSession('current');
            setUser(null);
            setProfile(null);
            toast({
                title: "Signed out successfully",
                description: "You have been signed out of your account.",
            });
        } catch (err: any) {
            console.error('Error signing out:', err);
            setError(new Error(err.message || 'Error signing out'));
            toast({
                title: "Error signing out",
                description: "An unexpected error occurred while signing out: " + (err.message || 'Unknown error'),
                variant: "destructive",
            });
        }
    };

    return (
        <AuthContext.Provider value={{ user, profile, loading, error, signOut, refreshUser }}>
            {children}
        </AuthContext.Provider>
    );
};
