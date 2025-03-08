import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Plus, Edit, Trash2, Eye } from "lucide-react";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/lib/AuthContext";
import { databases } from "@/lib/appwrite";
import { Query } from 'appwrite';
import { 
    APPWRITE_DATABASE_ID,
    APPWRITE_LISTINGS_COLLECTION_ID 
} from "@/lib/config";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function MyListings() {
  const { user } = useAuth();
  const [activeListings, setActiveListings] = useState<any[]>([]);
  const [soldListings, setSoldListings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) return;
    
    const fetchListings = async () => {
      setIsLoading(true);
      try {
        // Fetch active listings
        const activeResponse = await databases.listDocuments(
          APPWRITE_DATABASE_ID,
          APPWRITE_LISTINGS_COLLECTION_ID,
          [
            Query.equal('seller_id', user.$id),
            Query.equal('status', 'active'),
            Query.orderDesc('created_at')
          ]
        );
        setActiveListings(activeResponse.documents || []);
        
        // Fetch sold listings
        const soldResponse = await databases.listDocuments(
          APPWRITE_DATABASE_ID,
          APPWRITE_LISTINGS_COLLECTION_ID,
          [
            Query.equal('seller_id', user.$id),
            Query.equal('status', 'sold'),
            Query.orderDesc('created_at')
          ]
        );
        setSoldListings(soldResponse.documents || []);
      } catch (error: any) {
        console.error("Error fetching listings:", error);
        toast({
          title: "Error fetching listings",
          description: error.message || "An unexpected error occurred.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchListings();
  }, [user, toast]);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      // Delete the listing
      await databases.deleteDocument(
        APPWRITE_DATABASE_ID,
        APPWRITE_LISTINGS_COLLECTION_ID,
        id
      );
      
      // Remove from state
      setActiveListings(prev => prev.filter(listing => listing.$id !== id));
      setSoldListings(prev => prev.filter(listing => listing.$id !== id));
      
      toast({
        title: "Listing deleted",
        description: "Your listing has been deleted successfully.",
      });
    } catch (error: any) {
      console.error("Error deleting listing:", error);
      toast({
        title: "Error deleting listing",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  const markAsSold = async (id: string) => {
    try {
      // Update the listing status
      await databases.updateDocument(
        APPWRITE_DATABASE_ID,
        APPWRITE_LISTINGS_COLLECTION_ID,
        id,
        {
          status: 'sold',
          updated_at: new Date().toISOString()
        }
      );
      
      // Move from active to sold in state
      const listing = activeListings.find(item => item.$id === id);
      if (listing) {
        listing.status = 'sold';
        setActiveListings(prev => prev.filter(item => item.$id !== id));
        setSoldListings(prev => [listing, ...prev]);
      }
      
      toast({
        title: "Listing marked as sold",
        description: "Your listing has been marked as sold.",
      });
    } catch (error: any) {
      console.error("Error updating listing:", error);
      toast({
        title: "Error updating listing",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  };

  const reactivateListing = async (id: string) => {
    try {
      // Update the listing status
      await databases.updateDocument(
        APPWRITE_DATABASE_ID,
        APPWRITE_LISTINGS_COLLECTION_ID,
        id,
        {
          status: 'active',
          updated_at: new Date().toISOString()
        }
      );
      
      // Move from sold to active in state
      const listing = soldListings.find(item => item.$id === id);
      if (listing) {
        listing.status = 'active';
        setSoldListings(prev => prev.filter(item => item.$id !== id));
        setActiveListings(prev => [listing, ...prev]);
      }
      
      toast({
        title: "Listing reactivated",
        description: "Your listing is now active again.",
      });
    } catch (error: any) {
      console.error("Error updating listing:", error);
      toast({
        title: "Error updating listing",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-12 text-center">
          <h1 className="text-2xl font-bold">Please sign in to view your listings</h1>
          <Button className="mt-4" onClick={() => navigate("/signin")}>
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  const renderListingCard = (listing: any, isSold = false) => (
    <Card key={listing.$id} className="overflow-hidden">
      <div className="aspect-video w-full overflow-hidden bg-muted">
        {listing.images && listing.images.length > 0 ? (
          <img
            src={listing.images[0]}
            alt={listing.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            No image
          </div>
        )}
      </div>
      <CardHeader className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="line-clamp-1">{listing.title}</CardTitle>
            <CardDescription>₹{listing.price.toFixed(2)}</CardDescription>
          </div>
          <Badge variant={isSold ? "secondary" : "default"}>
            {isSold ? "Sold" : "Active"}
          </Badge>
        </div>
      </CardHeader>
      <CardFooter className="p-4 pt-0 flex gap-2 flex-wrap">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(`/product/${listing.$id}`)}
        >
          <Eye className="mr-2 h-4 w-4" />
          View
        </Button>
        {isSold ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => reactivateListing(listing.$id)}
          >
            Reactivate
          </Button>
        ) : (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/edit-listing/${listing.$id}`)}
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => markAsSold(listing.$id)}
            >
              Mark as Sold
            </Button>
          </>
        )}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm">
              {deletingId === listing.$id ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </>
              )}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your listing.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => handleDelete(listing.$id)}>
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">My Listings</h1>
          <Button onClick={() => navigate("/create-listing")}>
            <Plus className="mr-2 h-4 w-4" />
            Create Listing
          </Button>
        </div>

        <Tabs defaultValue="active">
          <TabsList>
            <TabsTrigger value="active">
              Active ({activeListings.length})
            </TabsTrigger>
            <TabsTrigger value="sold">
              Sold ({soldListings.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="mt-6">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : activeListings.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">
                  You don't have any active listings
                </p>
                <Button onClick={() => navigate("/create-listing")}>
                  Create Your First Listing
                </Button>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {activeListings.map(listing => renderListingCard(listing))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="sold" className="mt-6">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : soldListings.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  You don't have any sold listings
                </p>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {soldListings.map(listing => renderListingCard(listing, true))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
