
import { useState, useCallback, memo } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, Heart, ImageOff, MapPin } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { supabase } from '@/lib/supabase';
import { useInView } from 'react-intersection-observer';
import { useToast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';

interface Listing {
  id: string;
  title: string;
  price: number;
  category: string;
  condition: string;
  images: string[];
  created_at: string;
  location?: string;
  seller: {
    id: string;
    full_name: string;
    avatar_url: string;
  };
}

interface ListingGridProps {
  listings: Listing[];
  isLoading?: boolean;
  onWishlistToggle?: (listingId: string) => void;
  wishlistedItems?: Set<string>;
}

const ListingCard = memo(({ listing, onWishlistToggle, wishlistedItems, loadingStates, handleWishlistClick }: {
  listing: Listing;
  onWishlistToggle?: (listingId: string) => void;
  wishlistedItems: Set<string>;
  loadingStates: { [key: string]: boolean };
  handleWishlistClick: (listingId: string) => void;
}) => {
  const { user } = useAuth();
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const createdDate = new Date(listing.created_at);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - createdDate.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
  const diffMinutes = Math.floor(diffTime / (1000 * 60));

  const timeAgo = diffDays > 0 
    ? `${diffDays}d ago`
    : diffHours > 0 
      ? `${diffHours}h ago` 
      : `${diffMinutes}m ago`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card ref={ref} className="group overflow-hidden transition-all hover:shadow-lg">
        <Link to={`/product/${listing.id}`} className="block">
          <div className="aspect-[4/3] relative overflow-hidden bg-muted">
            {listing.images?.[0] ? (
              inView ? (
                <img
                  src={listing.images[0]}
                  alt={listing.title}
                  loading="lazy"
                  className="h-full w-full object-cover transition-all duration-300 group-hover:scale-105"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.onerror = null;
                    target.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxsaW5lIHgxPSI2IiB5MT0iNiIgeDI9IjE4IiB5Mj0iMTgiPjwvbGluZT48bGluZSB4MT0iMTgiIHkxPSI2IiB4Mj0iNiIgeTI9IjE4Ij48L2xpbmU+PC9zdmc+';
                  }}
                />
              ) : (
                <div className="h-full w-full animate-pulse bg-muted" />
              )
            ) : (
              <div className="flex h-full items-center justify-center bg-muted">
                <ImageOff className="h-8 w-8 text-muted-foreground" />
              </div>
            )}
            <div className="absolute bottom-2 left-2 flex gap-2">
              <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm capitalize">
                {listing.condition}
              </Badge>
              {timeAgo && (
                <Badge variant="outline" className="bg-background/80 backdrop-blur-sm">
                  {timeAgo}
                </Badge>
              )}
            </div>
          </div>
        </Link>

        <div className="p-4">
          <div className="flex items-start justify-between gap-2">
            <Link to={`/product/${listing.id}`} className="block flex-1">
              <h3 className="font-medium line-clamp-2 group-hover:text-primary">
                {listing.title}
              </h3>
            </Link>
            {user && onWishlistToggle && (
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0 text-muted-foreground hover:text-primary"
                onClick={(e) => {
                  e.preventDefault();
                  handleWishlistClick(listing.id);
                }}
                disabled={loadingStates[listing.id]}
              >
                {loadingStates[listing.id] ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : wishlistedItems.has(listing.id) ? (
                  <Heart className="h-5 w-5 text-primary fill-primary" />
                ) : (
                  <Heart className="h-5 w-5" />
                )}
              </Button>
            )}
          </div>

          <div className="mt-2 flex items-center justify-between">
            <p className="font-semibold">₹{listing.price.toLocaleString('en-IN')}</p>
            <Badge variant="secondary" className="capitalize">
              {listing.category}
            </Badge>
          </div>

          {listing.location && (
            <div className="mt-2 flex items-center text-sm text-muted-foreground">
              <MapPin className="mr-1 h-3 w-3" />
              <span className="truncate">{listing.location}</span>
            </div>
          )}

          <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
            {listing.seller.avatar_url ? (
              <img
                src={listing.seller.avatar_url}
                alt={listing.seller.full_name}
                className="h-5 w-5 rounded-full object-cover"
                loading="lazy"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.onerror = null;
                  target.style.display = 'none';
                }}
              />
            ) : (
              <div className="h-5 w-5 rounded-full bg-muted" />
            )}
            <span>{listing.seller.full_name}</span>
          </div>
        </div>
      </Card>
    </motion.div>
  );
});

ListingCard.displayName = 'ListingCard';

export default function ListingGrid({ 
  listings, 
  isLoading = false, 
  onWishlistToggle,
  wishlistedItems = new Set<string>()
}: ListingGridProps) {
  const { user } = useAuth();
  const [loadingStates, setLoadingStates] = useState<{ [key: string]: boolean }>({});
  const { toast } = useToast();

  const handleError = useCallback((error: Error) => {
    console.error('Error with wishlist:', error);
    toast({
      title: 'Error',
      description: 'Failed to update wishlist. Please try again.',
      variant: 'destructive',
    });
  }, [toast]);

  const handleWishlistClick = useCallback(async (listingId: string) => {
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'Please sign in to add items to your wishlist.',
        variant: 'default',
      });
      return;
    }
    
    setLoadingStates(prev => ({ ...prev, [listingId]: true }));
    
    try {
      if (wishlistedItems.has(listingId)) {
        const { error } = await supabase
          .from('wishlists')
          .delete()
          .eq('user_id', user.id)
          .eq('listing_id', listingId);

        if (error) throw error;
        
        toast({
          title: 'Removed from wishlist',
          description: 'Item removed from your wishlist.',
        });
      } else {
        const { error } = await supabase
          .from('wishlists')
          .insert([{ user_id: user.id, listing_id: listingId }]);

        if (error) throw error;
        
        toast({
          title: 'Added to wishlist',
          description: 'Item added to your wishlist.',
        });
      }

      onWishlistToggle?.(listingId);
    } catch (error) {
      handleError(error as Error);
    } finally {
      setLoadingStates(prev => ({ ...prev, [listingId]: false }));
    }
  }, [user, wishlistedItems, onWishlistToggle, handleError, toast]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {[...Array(8)].map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <div className="aspect-[4/3] bg-muted animate-pulse" />
            <div className="p-4 space-y-3">
              <div className="h-4 bg-muted animate-pulse rounded" />
              <div className="h-4 bg-muted animate-pulse rounded w-1/2" />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (listings.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-muted-foreground">No listings found</p>
        <p className="text-sm text-muted-foreground mt-2">Try adjusting your filters or search terms</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {listings.map((listing) => (
        <ListingCard
          key={listing.id}
          listing={listing}
          onWishlistToggle={onWishlistToggle}
          wishlistedItems={wishlistedItems}
          loadingStates={loadingStates}
          handleWishlistClick={handleWishlistClick}
        />
      ))}
    </div>
  );
}
