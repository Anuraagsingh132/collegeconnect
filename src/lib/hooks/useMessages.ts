
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabase';
import { useAuth } from '../AuthContext';
import { useToast } from '@/components/ui/use-toast';

export interface Message {
  id: string;
  content: string;
  created_at: string;
  read_at: string | null;
  sender_id: string;
  receiver_id: string;
  sender?: {
    id: string;
    full_name: string;
    avatar_url: string;
  };
  receiver?: {
    id: string;
    full_name: string;
    avatar_url: string;
  };
}

export function useConversations() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['conversations', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      // Get the latest message from each conversation
      const { data, error } = await supabase.rpc('get_conversations', {
        user_id: user.id
      });
      
      if (error) throw error;
      
      return data || [];
    },
    enabled: !!user,
  });
}

export function useMessages(otherUserId?: string) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['messages', user?.id, otherUserId],
    queryFn: async () => {
      if (!user || !otherUserId) return [];
      
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:profiles!sender_id(id, full_name, avatar_url),
          receiver:profiles!receiver_id(id, full_name, avatar_url)
        `)
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .or(`sender_id.eq.${otherUserId},receiver_id.eq.${otherUserId}`)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      
      return data as Message[];
    },
    enabled: !!user && !!otherUserId,
  });
}

export function useSendMessage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ receiverId, content }: { receiverId: string; content: string }) => {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('messages')
        .insert([
          {
            sender_id: user.id,
            receiver_id: receiverId,
            content
          }
        ])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['messages', user?.id, variables.receiverId] });
      queryClient.invalidateQueries({ queryKey: ['conversations', user?.id] });
    },
    onError: (error) => {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message. Please try again.',
        variant: 'destructive',
      });
    },
  });
}

export function useMarkMessageAsRead() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (messageId: string) => {
      const { error } = await supabase
        .from('messages')
        .update({ read_at: new Date().toISOString() })
        .eq('id', messageId);
      
      if (error) throw error;
      return messageId;
    },
    onSuccess: (_, messageId) => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
}
