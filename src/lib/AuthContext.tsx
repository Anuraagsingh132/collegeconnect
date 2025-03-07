import { createContext, useContext, useEffect, useState } from 'react';
import { supabase, getCurrentUser } from './supabase';
import { User } from '@supabase/supabase-js';
import { useToast } from '@/components/ui/use-toast';

type AuthContextType = {
  user: User | null;
  userProfile: any | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const refreshUser = async () => {
    try {
      const { data, error } = await getCurrentUser();

      if (error) {
        console.error('Error fetching user:', error);
        return;
      }

      if (data?.user) {
        setUser(data.user);

        // Fetch user profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (profileError && profileError.code !== 'PGRST116') {
          console.error('Error fetching profile:', profileError);
        }

        if (profileData) {
          setUserProfile(profileData);
        }
      } else {
        setUser(null);
        setUserProfile(null);
      }
    } catch (error) {
      console.error('Unexpected error during auth check:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      try {
        setIsLoading(true);
        const { data: { user: currentUser }, error: sessionError } = await supabase.auth.getUser();

        if (sessionError) {
          console.error('Error getting user:', sessionError);
          toast({
            title: 'Authentication Error',
            description: sessionError.message,
            variant: 'destructive',
          });
          return;
        }

        if (currentUser) {
          setUser(currentUser);
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', currentUser.id)
            .single();

          if (profileError) {
            if (profileError.code === 'PGRST116') {
              // Profile doesn't exist, create it
              const { error: insertError } = await supabase
                .from('profiles')
                .insert([
                  {
                    id: currentUser.id,
                    email: currentUser.email,
                    full_name: currentUser.user_metadata.full_name || '',
                    avatar_url: currentUser.user_metadata.avatar_url || '',
                    created_at: new Date().toISOString(),
                  }
                ]);

              if (insertError) {
                console.error('Error creating profile:', insertError);
                toast({
                  title: 'Error creating profile',
                  description: insertError.message,
                  variant: 'destructive',
                });
              } else {
                const { data: newProfile } = await supabase
                  .from('profiles')
                  .select('*')
                  .eq('id', currentUser.id)
                  .single();
                setUserProfile(newProfile);
              }
            } else {
              console.error('Error fetching profile:', profileError);
              toast({
                title: 'Error fetching profile',
                description: profileError.message,
                variant: 'destructive',
              });
            }
          } else {
            setUserProfile(profileData);
          }
        }
      } catch (error) {
        console.error('Error during auth initialization:', error);
        toast({
          title: 'Authentication Error',
          description: 'An unexpected error occurred during authentication.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session);

        if (event === 'SIGNED_OUT') {
          setUser(null);
          setUserProfile(null);
          return;
        }

        if (session?.user) {
          setUser(session.user);
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (profileData) {
            setUserProfile(profileData);
          }
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [toast]);

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast({
          title: "Error signing out",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Signed out successfully",
          description: "You have been signed out of your account.",
        });
      }
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        title: "Error signing out",
        description: "An unexpected error occurred while signing out.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        isLoading,
        signOut: handleSignOut,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
