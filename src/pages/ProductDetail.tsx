import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, Heart, Info, MessageCircle, Share2 } from 'lucide-react';
import { databases, getImageUrl } from '@/lib/appwrite';
import { APPWRITE_DATABASE_ID, APPWRITE_LISTINGS_COLLECTION_ID, APPWRITE_LISTINGS_BUCKET_ID } from '@/lib/config';
import { useToast } from '@/components/ui/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchListing = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const response = await databases.getDocument(
          APPWRITE_DATABASE_ID,
          APPWRITE_LISTINGS_COLLECTION_ID,
          id
        );
        
        setItem(response);
      } catch (error: any) {
        console.error('Error fetching listing:', error);
        toast({
          title: 'Error',
          description: error.message || 'Failed to load listing. It may have been removed or you don\'t have permission to view it.',
          variant: 'destructive',
        });
        navigate('/explore');
      } finally {
        setLoading(false);
      }
    };
    
    fetchListing();
  }, [id, toast, navigate]);
  
  // Format relative time
  const formatRelativeTime = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };
  
  // Get the proper image URL from Appwrite storage
  const getImageSource = (imageId: string) => {
    // If the image is already a full URL (e.g., https://...), return it as is
    if (imageId && (imageId.startsWith('http://') || imageId.startsWith('https://'))) {
      return imageId;
    }
    
    // Otherwise, convert the image ID to a proper Appwrite storage URL
    if (imageId) {
      try {
        return getImageUrl(APPWRITE_LISTINGS_BUCKET_ID, imageId);
      } catch (error) {
        console.error(`Error getting image URL for ID ${imageId}:`, error);
        return 'https://placehold.co/600x600?text=No+Image';
      }
    }
    
    return 'https://placehold.co/600x600?text=No+Image';
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        
        <main className="pt-28 pb-20">
          <div className="container px-6 mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Image Gallery Skeleton */}
              <div className="space-y-4">
                <Skeleton className="aspect-square rounded-xl w-full" />
                <div className="flex items-center gap-4">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="w-20 h-20 rounded-lg" />
                  ))}
                </div>
              </div>
              
              {/* Product Details Skeleton */}
              <div className="space-y-6">
                <div>
                  <Skeleton className="h-5 w-1/3 mb-2" />
                  <Skeleton className="h-10 w-full mb-2" />
                  <Skeleton className="h-8 w-1/4" />
                </div>
                
                <Skeleton className="h-24 w-full rounded-xl" />
                
                <div className="space-y-2">
                  <Skeleton className="h-6 w-1/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
                
                <Skeleton className="h-24 w-full rounded-xl" />
                
                <Skeleton className="h-12 w-full" />
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }
  
  if (!item) return null;
  
  // Prepare display values
  const images = item.images || [];
  const createdAt = new Date(item.created_at);
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-28 pb-20">
        <div className="container px-6 mx-auto">
          <Link to="/explore" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to listings
          </Link>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Image Gallery */}
            <div className="space-y-4">
              <div className="aspect-square rounded-xl overflow-hidden">
                {images.length > 0 ? (
                  <img 
                    src={getImageSource(images[activeImageIndex])} 
                    alt={item.title}
                    className="w-full h-full object-cover transition-all duration-300"
                    onError={(e) => {
                      console.error(`Failed to load main image: ${images[activeImageIndex]}`);
                      const target = e.target as HTMLImageElement;
                      target.onerror = null;
                      target.src = 'https://placehold.co/600x600?text=No+Image';
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-secondary">
                    <p className="text-muted-foreground">No image available</p>
                  </div>
                )}
              </div>
              
              {images.length > 1 && (
                <div className="flex items-center gap-4 overflow-x-auto scroll-hidden">
                  {images.map((image: string, index: number) => (
                    <button
                      key={index}
                      className={`relative rounded-lg overflow-hidden flex-shrink-0 w-20 h-20 ${
                        activeImageIndex === index ? 'ring-2 ring-primary' : ''
                      }`}
                      onClick={() => setActiveImageIndex(index)}
                    >
                      <img 
                        src={getImageSource(image)} 
                        alt={`${item.title} - view ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.onerror = null;
                          target.src = 'https://placehold.co/200x200?text=Error';
                        }}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            {/* Product Details */}
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {item.category} • {formatRelativeTime(createdAt)}
                  </span>
                  
                  <div className="flex items-center gap-2">
                    <button
                      className="p-2 rounded-full hover:bg-secondary transition-colors"
                      aria-label="Share"
                    >
                      <Share2 className="h-5 w-5" />
                    </button>
                    <button
                      className="p-2 rounded-full hover:bg-secondary transition-colors"
                      aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                      onClick={() => setIsWishlisted(!isWishlisted)}
                    >
                      <Heart 
                        className={`h-5 w-5 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} 
                      />
                    </button>
                  </div>
                </div>
                
                <h1 className="text-2xl md:text-3xl font-display font-bold mt-2">
                  {item.title}
                </h1>
                
                <div className="mt-2 flex items-center">
                  <span className="text-xl md:text-2xl font-bold">₹{Number(item.price).toFixed(2)}</span>
                </div>
              </div>
              
              <div className="glass p-4 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
                    <span className="text-lg font-medium">{item.seller_name?.charAt(0) || '?'}</span>
                  </div>
                  <div>
                    <h3 className="font-medium">{item.seller_name || 'Unknown Seller'}</h3>
                  </div>
                </div>
                
                <div className="mt-4">
                  <Button 
                    className="w-full flex items-center justify-center"
                    onClick={() => navigate(`/messages?listing=${item.$id}`)}
                  >
                    <MessageCircle className="mr-2 h-5 w-5" />
                    Message Seller
                  </Button>
                </div>
              </div>
              
              <div>
                <h2 className="text-lg font-medium mb-2">Description</h2>
                <p className="text-muted-foreground whitespace-pre-line">
                  {item.description || 'No description provided.'}
                </p>
              </div>
              
              <div className="glass p-4 rounded-xl grid grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <h3 className="text-sm font-medium">Condition</h3>
                    <p className="text-sm text-muted-foreground">{item.condition || 'Not specified'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <h3 className="text-sm font-medium">Posted</h3>
                    <p className="text-sm text-muted-foreground">{formatRelativeTime(createdAt)}</p>
                  </div>
                </div>
              </div>
              
              <div className="pt-4 border-t border-input flex gap-4">
                <Button variant="outline" className="w-1/2" onClick={() => setIsWishlisted(!isWishlisted)}>
                  <Heart className={`mr-2 h-4 w-4 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
                  {isWishlisted ? 'Saved' : 'Save'}
                </Button>
                <Button 
                  className="w-1/2"
                  onClick={() => navigate(`/messages?listing=${item.$id}`)}
                >
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Message
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProductDetail;
