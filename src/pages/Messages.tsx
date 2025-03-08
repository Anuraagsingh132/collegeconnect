import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Send } from "lucide-react";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/lib/AuthContext";
import { databases, client } from "@/lib/appwrite";
import { 
    APPWRITE_DATABASE_ID,
    APPWRITE_MESSAGES_COLLECTION_ID,
    APPWRITE_LISTINGS_COLLECTION_ID,
    APPWRITE_PROFILES_COLLECTION_ID 
} from "@/lib/config";
import { Query } from "appwrite";
import { ID } from "appwrite";

interface Message {
    $id: string;
    sender_id: string;
    receiver_id: string;
    listing_id: string;
    message: string;
    created_at: string;
}

interface Conversation {
    $id: string;
    listing_id: string;
    listing_title?: string;
    sender_id: string;
    receiver_id: string;
    last_read: string;
    last_message?: string;
    last_message_time?: string;
    other_user: {
        $id: string;
        full_name: string;
        avatar_url: string;
    };
}

export default function Messages() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const listingId = searchParams.get('listing');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Handle listing parameter from URL
  useEffect(() => {
    if (listingId && user) {
      // Check if we need to initiate a new conversation
      const matchingConversation = conversations.find(c => c.listing_id === listingId);
      if (matchingConversation) {
        setSelectedConversation(matchingConversation);
      } else if (!loadingConversations) {
        // Fetch listing details to create a new conversation
        const fetchListingDetails = async () => {
          try {
            const listing = await databases.getDocument(
              APPWRITE_DATABASE_ID,
              APPWRITE_LISTINGS_COLLECTION_ID,
              listingId
            );
            
            if (listing) {
              // Create a new conversation object
              const newConversation: Conversation = {
                $id: ID.unique(),
                listing_id: listingId,
                listing_title: listing.title,
                sender_id: user.$id,
                receiver_id: listing.seller_id,
                last_read: new Date().toISOString(),
                other_user: {
                  $id: listing.seller_id,
                  full_name: listing.seller_name || "Seller",
                  avatar_url: ""
                }
              };
              
              setSelectedConversation(newConversation);
              setConversations(prev => [newConversation, ...prev]);
            }
          } catch (error) {
            console.error('Error fetching listing details:', error);
            toast({
              title: "Error",
              description: "Failed to start conversation for this listing",
              variant: "destructive"
            });
          }
        };
        
        fetchListingDetails();
      }
    }
  }, [listingId, user, conversations, loadingConversations, toast]);

  // Fetch conversations
  useEffect(() => {
    if (!user) return;
    
    const fetchConversations = async () => {
      setLoadingConversations(true);
      try {
        // Get conversations where user is either sender or receiver
        const senderResponse = await databases.listDocuments(
          APPWRITE_DATABASE_ID,
          APPWRITE_MESSAGES_COLLECTION_ID,
          [
            Query.equal('sender_id', user.$id),
            Query.limit(100),
            Query.orderDesc('created_at')
          ]
        );
        
        const receiverResponse = await databases.listDocuments(
          APPWRITE_DATABASE_ID,
          APPWRITE_MESSAGES_COLLECTION_ID,
          [
            Query.equal('receiver_id', user.$id),
            Query.limit(100),
            Query.orderDesc('created_at')
          ]
        );
        
        // Combine both lists and remove duplicates
        const allMessages = [...senderResponse.documents, ...receiverResponse.documents];
        
        // Group by listing_id to create conversations
        const conversationMap = new Map<string, any>();
        
        for (const msg of allMessages) {
          const listingId = msg.listing_id as string;
          if (!conversationMap.has(listingId)) {
            // Determine the other user
            const otherUserId = msg.sender_id === user.$id ? msg.receiver_id : msg.sender_id;
            
            try {
              // Fetch listing details
              const listing = await databases.getDocument(
                APPWRITE_DATABASE_ID, 
                APPWRITE_LISTINGS_COLLECTION_ID,
                listingId
              );
              
              // Fetch other user profile
              const userProfile = await databases.listDocuments(
                APPWRITE_DATABASE_ID,
                APPWRITE_PROFILES_COLLECTION_ID,
                [Query.equal('user_id', otherUserId)]
              );
              
              const otherUser = userProfile.documents.length > 0 ? userProfile.documents[0] : null;
              
              conversationMap.set(listingId, {
                $id: msg.$id,
                listing_id: listingId,
                listing_title: listing.title,
                sender_id: user.$id,
                receiver_id: otherUserId,
                last_read: new Date().toISOString(),
                last_message: msg.message,
                last_message_time: msg.created_at,
                other_user: {
                  $id: otherUserId,
                  full_name: otherUser?.full_name || listing.seller_name || "User",
                  avatar_url: otherUser?.avatar_url || ""
                }
              });
            } catch (error) {
              console.error(`Error fetching details for conversation ${listingId}:`, error);
            }
          }
        }
        
        // Convert map to array and sort by last message time
        const conversations = Array.from(conversationMap.values())
          .sort((a, b) => new Date(b.last_message_time).getTime() - new Date(a.last_message_time).getTime());
        
        setConversations(conversations);
        
        // Select the first conversation by default if available and no listing specified
        if (conversations.length > 0 && !selectedConversation && !listingId) {
          setSelectedConversation(conversations[0]);
        }
      } catch (error: any) {
        console.error("Error fetching conversations:", error);
        toast({
          title: "Error fetching conversations",
          description: error.message || "An unexpected error occurred.",
          variant: "destructive",
        });
      } finally {
        setLoadingConversations(false);
      }
    };
    
    fetchConversations();
    
    // Subscribe to real-time updates
    const unsubscribe = client.subscribe(`databases.${APPWRITE_DATABASE_ID}.collections.${APPWRITE_MESSAGES_COLLECTION_ID}.documents`, 
      (response: any) => {
        // Handle new messages
        if (response.events.includes('databases.*.collections.*.documents.*.create')) {
          // Refresh conversations
          fetchConversations();
        }
      }
    );
    
    return () => {
      unsubscribe();
    };
  }, [user, toast, selectedConversation, listingId]);

  // Fetch messages for selected conversation
  useEffect(() => {
    if (!selectedConversation || !user) return;
    
    const fetchMessages = async () => {
      setLoadingMessages(true);
      try {
        const response = await databases.listDocuments(
          APPWRITE_DATABASE_ID,
          APPWRITE_MESSAGES_COLLECTION_ID,
          [
            Query.equal('listing_id', selectedConversation.listing_id),
            Query.orderAsc('created_at'),
            Query.limit(100)
          ]
        );

        // Transform documents to Message type
        const fetchedMessages: Message[] = response.documents.map(doc => ({
          $id: doc.$id,
          sender_id: doc.sender_id as string,
          receiver_id: doc.receiver_id as string,
          listing_id: doc.listing_id as string,
          message: doc.message as string,
          created_at: doc.created_at as string,
        }));

        setMessages(fetchedMessages);
        
        // We don't need to mark messages as read since the field doesn't exist in the schema
      } catch (error: any) {
        console.error("Error fetching messages:", error);
        toast({
          title: "Error fetching messages",
          description: error.message || "An unexpected error occurred.",
          variant: "destructive",
        });
      } finally {
        setLoadingMessages(false);
      }
    };
    
    fetchMessages();
    
    // Subscribe to real-time updates for this specific conversation
    const unsubscribe = client.subscribe(`databases.${APPWRITE_DATABASE_ID}.collections.${APPWRITE_MESSAGES_COLLECTION_ID}.documents`, 
      (response: any) => {
        // Handle new messages
        if (response.events.includes('databases.*.collections.*.documents.*.create')) {
          const newMessage = response.payload;
          if (newMessage.listing_id === selectedConversation.listing_id) {
            // Add to messages if it belongs to current conversation
            setMessages(prev => [...prev, {
              $id: newMessage.$id,
              sender_id: newMessage.sender_id,
              receiver_id: newMessage.receiver_id,
              listing_id: newMessage.listing_id,
              message: newMessage.message,
              created_at: newMessage.created_at,
            }]);
            
            // No need to mark as read since the field doesn't exist
          }
        }
      }
    );
    
    return () => {
      unsubscribe();
    };
  }, [selectedConversation, user, toast]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation || !user) return;

    setIsSending(true);
    try {
      await sendMessage(newMessage);
      setNewMessage("");
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const sendMessage = async (message: string) => {
    if (!selectedConversation || !user) return;

    try {
      await databases.createDocument(
        APPWRITE_DATABASE_ID,
        APPWRITE_MESSAGES_COLLECTION_ID,
        ID.unique(),
        {
          sender_id: user.$id,
          receiver_id: selectedConversation.receiver_id,
          listing_id: selectedConversation.listing_id,
          message: message,
          created_at: new Date().toISOString()
        }
      );
      
      // Log success
      console.log('Message sent successfully');
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
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
              {loadingConversations ? (
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
                      key={conversation.$id}
                      className={`p-4 cursor-pointer hover:bg-accent/80 ${
                        selectedConversation?.listing_id === conversation.listing_id 
                          ? "bg-accent/80 border-l-4 border-l-primary" 
                          : ""
                      }`}
                      onClick={() => setSelectedConversation(conversation)}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="border-2 border-primary">
                          <AvatarImage src={conversation.other_user.avatar_url} />
                          <AvatarFallback className="bg-primary text-primary-foreground font-bold">
                            {conversation.other_user.full_name.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-semibold text-foreground">{conversation.other_user.full_name || 'User'}</p>
                          <p className="text-sm font-medium text-foreground/80 truncate">
                            {conversation.listing_title || 'Item'}
                          </p>
                          {conversation.last_message && (
                            <p className="text-sm text-foreground/70 truncate mt-1">
                              {conversation.last_message.substring(0, 30)}
                              {conversation.last_message.length > 30 ? '...' : ''}
                            </p>
                          )}
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
                    <Avatar className="border-2 border-primary">
                      <AvatarImage src={selectedConversation.other_user?.avatar_url || ""} />
                      <AvatarFallback className="bg-primary text-primary-foreground font-bold">
                        {selectedConversation.other_user?.full_name?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h2 className="font-semibold text-foreground">
                        {selectedConversation.other_user?.full_name || "User"}
                      </h2>
                      <p className="text-sm font-medium text-foreground/80">
                        {selectedConversation.listing_title || selectedConversation.listing_id}
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
                  {loadingMessages ? (
                    <div className="flex justify-center py-12">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                          No messages yet. Start the conversation!
                        </div>
                      ) : (
                        messages.map((message) => (
                          <div
                            key={message.$id}
                            className={`flex ${
                              message.sender_id === user.$id ? "justify-end" : "justify-start"
                            }`}
                          >
                            <div
                              className={`max-w-[80%] rounded-lg p-3 ${
                                message.sender_id === user.$id
                                  ? "bg-primary text-primary-foreground font-medium shadow-sm"
                                  : "bg-secondary text-secondary-foreground font-medium shadow-sm"
                              }`}
                            >
                              {message.message}
                            </div>
                          </div>
                        ))
                      )}
                      <div ref={messagesEndRef} />
                    </div>
                  )}
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
