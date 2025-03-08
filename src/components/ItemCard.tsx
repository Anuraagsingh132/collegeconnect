import React from 'react';
import { Heart, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getImageUrl } from '@/lib/appwrite';
import { APPWRITE_LISTINGS_BUCKET_ID } from '@/lib/config';

interface ItemCardProps {
  id: string;
  title: string;
  price: number;
  image: string;
  sellerName: string;
  sellerAvatar?: string;
  createdAt: Date;
  isFeatured?: boolean;
  isWishlisted?: boolean;
  category?: string;
}

const ItemCard: React.FC<ItemCardProps> = ({
  id,
  title,
  price,
  image,
  sellerName,
  sellerAvatar,
  createdAt,
  isFeatured = false,
  isWishlisted = false,
  category,
}) => {
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
      console.log(`Getting image URL for ID: ${imageId}`);
      try {
        return getImageUrl(APPWRITE_LISTINGS_BUCKET_ID, imageId);
      } catch (error) {
        console.error(`Error getting image URL for ID ${imageId}:`, error);
        return '';
      }
    }
    
    return '';
  };
  
  return (
    <div className="group relative transition-all duration-300 h-full">
      <div className="aspect-square overflow-hidden rounded-xl relative">
        {image ? (
          <Link to={`/product/${id}`}>
            <img 
              src={getImageSource(image)} 
              alt={title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              onError={(e) => {
                console.error(`Failed to load image: ${image}`);
                const target = e.target as HTMLImageElement;
                target.onerror = null;
                target.src = ''; // Reset src to avoid infinite error loop
                target.alt = 'Image not available';
              }}
            />
          </Link>
        ) : (
          <Link to={`/product/${id}`}>
            <div className="w-full h-full flex items-center justify-center bg-secondary">
              <p className="text-muted-foreground">No image</p>
            </div>
          </Link>
        )}
        
        {/* Actions */}
        <div className="absolute top-3 right-3 flex flex-col gap-2">
          <button 
            className="p-2 rounded-full glass hover:bg-white/90 transition-colors"
            aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart 
              className={`h-4 w-4 ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-foreground'}`} 
            />
          </button>
          <Link
            to={`/messages?listing=${id}`}
            className="p-2 rounded-full glass hover:bg-white/90 transition-colors"
            aria-label="Message seller"
          >
            <MessageCircle className="h-4 w-4" />
          </Link>
        </div>
        
        {/* Featured badge */}
        {isFeatured && (
          <div className="absolute top-3 left-3">
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-primary text-primary-foreground">
              Featured
            </span>
          </div>
        )}
        
        {/* Category badge */}
        {category && (
          <div className="absolute bottom-3 left-3">
            <span className="px-2 py-1 rounded-full text-xs font-medium glass">
              {category}
            </span>
          </div>
        )}
      </div>
      
      <div className="mt-3 flex flex-col">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">{formatRelativeTime(createdAt)}</span>
          <span className="font-medium">₹{price.toFixed(2)}</span>
        </div>
        
        <Link to={`/product/${id}`} className="mt-1 block">
          <h3 className="text-base font-medium leading-tight group-hover:text-primary transition-colors line-clamp-1">
            {title}
          </h3>
        </Link>
        
        <div className="mt-2 flex items-center gap-2">
          {sellerAvatar ? (
            <img 
              src={getImageSource(sellerAvatar)} 
              alt={sellerName}
              className="w-6 h-6 rounded-full"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.onerror = null;
                target.src = ''; // Reset src to avoid infinite error loop
                target.alt = sellerName.charAt(0);
              }}
            />
          ) : (
            <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center">
              <span className="text-xs font-medium">{sellerName.charAt(0)}</span>
            </div>
          )}
          <span className="text-sm text-muted-foreground">{sellerName}</span>
        </div>
      </div>
    </div>
  );
};

export default ItemCard;
