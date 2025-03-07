import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Send } from "lucide-react";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/lib/AuthContext";
import { supabase } from "@/lib/supabase";

export default function Messages() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Fetch conversations
  useEffect(() => {
    if (!user) return;
    
    const fetchConversations = async () => {
      setIsLoading(true);
      try {
        // Get all conversations where the user is either the sender or receiver
        const { data, error } = await supabase
          .from('conversations')
          .select(`
            *,
            listing:listing_id(id, title, images),
            other_user:profiles!conversations_other_user_id_fkey(id, full_name, avatar_url)
          `)
          .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
          .order('updated_at', { ascending: false });
        
        if (error) throw error;
        
        // Process the conversations to get the other user's info
        const processedConversations = data.map(conv => ({
          ...conv,
          other_user: conv.sender_id === user.id ? conv.other_user : conv.other_user,
        }));
        
        setConversations(processedConversations || []);
        
        // Select the first conversation by default if available
        if (processedConversations.length > 0 && !selectedConversation) {
          setSelectedConversation(processedConversations[0]);
        }
      } catch (error: any) {
        console.error("Error fetching conversations:", error);
        toast({
          title: "Error fetching conversations",
          description: error.message || "An unexpected error occurred.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchConversations();
    
    // Set up real-time subscription for new conversations
    const conversationsSubscription = supabase
      .channel('conversations-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'conversations',
        filter: `sender_id=eq.${user.id} OR receiver_id=eq.${user.id}`,
      }, () => {
        fetchConversations();
      })
      .subscribe();
    
    return () => {
      conversationsSubscription.unsubscribe();
    };
  }, [user, toast]);

  // Fetch messages for selected conversation
  useEffect(() => {
    if (!selectedConversation) return;
    
    const fetchMessages = async () => {
      try {
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .eq('conversation_id', selectedConversation.id)
          .order('created_at', { ascending: true });
        
        if (error) throw error;
        
        setMessages(data || []);
        
        // Mark messages as read
        if (data && data.length > 0) {
          const unreadMessages = data.filter(
            msg => msg.receiver_id === user?.id && !msg.is_read
          );
          
          if (unreadMessages.length > 0) {
            await supabase
              .from('messages')
              .update({ is_read: true })
              .in('id', unreadMessages.map(msg => msg.id));
            
            // Update conversation last_read
            await supabase
              .from('conversations')
              .update({ last_read: new Date().toISOString() })
              .eq('id', selectedConversation.id);
          }
        }
      } catch (error: any) {
        console.error("Error fetching messages:", error);
        toast({
          title: "Error fetching messages",
          description: error.message || "An unexpected error occurred.",
          variant: "destructive",
        });
      }
    };
    
    fetchMessages();
    
    // Set up real-time subscription for new messages
    const messagesSubscription = supabase
      .channel(`messages-${selectedConversation.id}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${selectedConversation.id}`,
      }, () => {
        fetchMessages();
      })
      .subscribe();
    
    return () => {
      messagesSubscription.unsubscribe();
    };
  }, [selectedConversation, user, toast]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !selectedConversation || !newMessage.trim()) return;
    
    setIsSending(true);
    try {
      // Add message to database
      const { error } = await supabase
        .from('messages')
        .insert([
          {
            conversation_id: selectedConversation.id,
            sender_id: user.id,
            receiver_id: selectedConversation.sender_id === user.id 
              ? selectedConversation.receiver_id 
              : selectedConversation.sender_id,
            content: newMessage,
            is_read: false,
          }
        ]);
      
      if (error) throw error;
      
      // Update conversation's updated_at timestamp
      await supabase
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', selectedConversation.id);
      
      setNewMessage("");
    } catch (error: any) {
      console.error("Error sending message:", error);
      toast({
        title: "Error sending message",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-12 text-center">
          <h1 className="text-2xl font-bold">Please sign in to view your messages</h1>
          <Button className="mt-4" onClick={() => navigate("/signin")}>
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container py-6">
        <h1 className="text-3xl font-bold mb-6">Messages</h1>
        
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 lg:grid-cols-4">
          {/* Conversations List */}
          <div className="md:col-span-1 border rounded-lg overflow-hidden">
            <div className="p-4 border-b bg-muted/30">
              <h2 className="font-semibold">Conversations</h2>
            </div>
            
            <ScrollArea className="h-[calc(80vh-10rem)]">
              {isLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : conversations.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  No conversations yet
                </div>
              ) : (
                <div className="divide-y">
                  {conversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      className={`p-4 cursor-pointer hover:bg-muted/50 ${
                        selectedConversation?.id === conversation.id ? "bg-muted" : ""
                      }`}
                      onClick={() => setSelectedConversation(conversation)}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={conversation.other_user?.avatar_url || ""} />
                          <AvatarFallback>
                            {conversation.other_user?.full_name?.charAt(0) || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">
                            {conversation.other_user?.full_name || "User"}
                          </p>
                          <p className="text-sm text-muted-foreground truncate">
                            {conversation.listing?.title || "Item"}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
          
          {/* Messages */}
          <div className="md:col-span-2 lg:col-span-3 border rounded-lg overflow-hidden flex flex-col">
            {selectedConversation ? (
              <>
                <div className="p-4 border-b bg-muted/30 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={selectedConversation.other_user?.avatar_url || ""} />
                      <AvatarFallback>
                        {selectedConversation.other_user?.full_name?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h2 className="font-semibold">
                        {selectedConversation.other_user?.full_name || "User"}
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        {selectedConversation.listing?.title || "Item"}
                      </p>
                    </div>
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/product/${selectedConversation.listing_id}`)}
                  >
                    View Item
                  </Button>
                </div>
                
                <ScrollArea className="flex-1 p-4 h-[calc(80vh-16rem)]">
                  <div className="space-y-4">
                    {messages.length === 0 ? (
                      <div className="text-center py-12 text-muted-foreground">
                        No messages yet. Start the conversation!
                      </div>
                    ) : (
                      messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${
                            message.sender_id === user.id ? "justify-end" : "justify-start"
                          }`}
                        >
                          <div
                            className={`max-w-[80%] rounded-lg p-3 ${
                              message.sender_id === user.id
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted"
                            }`}
                          >
                            <p>{message.content}</p>
                            <p className="text-xs mt-1 opacity-70">
                              {new Date(message.created_at).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>
                
                <form onSubmit={handleSendMessage} className="p-4 border-t flex gap-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    disabled={isSending}
                  />
                  <Button type="submit" disabled={!newMessage.trim() || isSending}>
                    {isSending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center p-4 text-center text-muted-foreground">
                {conversations.length === 0 ? (
                  <div>
                    <p className="mb-2">You don't have any conversations yet.</p>
                    <Button onClick={() => navigate("/explore")}>
                      Browse Items
                    </Button>
                  </div>
                ) : (
                  <p>Select a conversation to view messages</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
