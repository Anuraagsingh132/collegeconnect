
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabase';
import { ListingData } from '../listingService';
import { useToast } from '@/components/ui/use-toast';

export function useListings(filters: {
  category?: string;
  searchQuery?: string;
  sortBy?: string;
  status?: string;
} = {}) {
  const { category, searchQuery, sortBy = 'created_at.desc', status = 'active' } = filters;
  
  return useQuery({
    queryKey: ['listings', category, searchQuery, sortBy, status],
    queryFn: async () => {
      let query = supabase
        .from('listings')
        .select(`
          *,
          seller:profiles(id, full_name, avatar_url)
        `)
        .eq('status', status);

      // Apply category filter if provided
      if (category && category !== 'All') {
        query = query.eq('category', category);
      }

      // Apply search query if provided
      if (searchQuery) {
        query = query.ilike('title', `%${searchQuery}%`);
      }

      // Apply sorting
      const [column, order] = sortBy.split('.');
      query = query.order(column, { ascending: order === 'asc' });

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return data as ListingData[];
    },
  });
}

export function useListingById(id?: string) {
  return useQuery({
    queryKey: ['listing', id],
    queryFn: async () => {
      if (!id) throw new Error('Listing ID is required');
      
      const { data, error } = await supabase
        .from('listings')
        .select(`
          *,
          seller:profiles(id, full_name, avatar_url)
        `)
        .eq('id', id)
        .single();

      if (error) {
        throw error;
      }

      return data as ListingData;
    },
    enabled: !!id,
  });
}

export function useDeleteListing() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (listingId: string) => {
      const { error } = await supabase
        .from('listings')
        .update({ status: 'deleted' })
        .eq('id', listingId);

      if (error) throw error;
      return listingId;
    },
    onSuccess: (listingId) => {
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      queryClient.invalidateQueries({ queryKey: ['listing', listingId] });
      toast({
        title: 'Listing deleted',
        description: 'Your listing has been successfully deleted.',
      });
    },
    onError: (error) => {
      console.error('Error deleting listing:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete listing. Please try again.',
        variant: 'destructive',
      });
    },
  });
}
