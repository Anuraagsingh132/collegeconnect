
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabase';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '../AuthContext';

export function useWishlist() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['wishlist', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('wishlists')
        .select('listing_id')
        .eq('user_id', user.id);

      if (error) throw error;
      
      return new Set(data.map(item => item.listing_id));
    },
    enabled: !!user,
  });
}

export function useWishlistItems() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['wishlist-items', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('wishlists')
        .select(`
          listing_id,
          listings (
            *,
            seller:profiles(id, full_name, avatar_url)
          )
        `)
        .eq('user_id', user.id);

      if (error) throw error;
      
      return data.map(item => item.listings);
    },
    enabled: !!user,
  });
}

export function useWishlistMutations() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const addToWishlist = useMutation({
    mutationFn: async (listingId: string) => {
      if (!user) throw new Error('User not authenticated');
      
      const { error } = await supabase
        .from('wishlists')
        .insert([
          { user_id: user.id, listing_id: listingId }
        ]);
      
      if (error) throw error;
      return listingId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      queryClient.invalidateQueries({ queryKey: ['wishlist-items'] });
      toast({
        title: 'Added to wishlist',
        description: 'Item added to your wishlist.',
      });
    },
    onError: (error) => {
      console.error('Error adding to wishlist:', error);
      toast({
        title: 'Error',
        description: 'Failed to add item to wishlist. Please try again.',
        variant: 'destructive',
      });
    },
  });
  
  const removeFromWishlist = useMutation({
    mutationFn: async (listingId: string) => {
      if (!user) throw new Error('User not authenticated');
      
      const { error } = await supabase
        .from('wishlists')
        .delete()
        .eq('user_id', user.id)
        .eq('listing_id', listingId);
      
      if (error) throw error;
      return listingId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      queryClient.invalidateQueries({ queryKey: ['wishlist-items'] });
      toast({
        title: 'Removed from wishlist',
        description: 'Item removed from your wishlist.',
      });
    },
    onError: (error) => {
      console.error('Error removing from wishlist:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove item from wishlist. Please try again.',
        variant: 'destructive',
      });
    },
  });
  
  return { addToWishlist, removeFromWishlist };
}
