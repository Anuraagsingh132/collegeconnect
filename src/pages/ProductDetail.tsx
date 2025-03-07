
import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Button from '../components/Button';
import { ArrowLeft, Calendar, Heart, Info, MessageCircle, Share2 } from 'lucide-react';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [isWishlisted, setIsWishlisted] = useState(false);
  
  // In a real app, you would fetch this data based on the ID
  const item = {
    id: '1',
    title: 'MacBook Pro 2023 - Perfect Condition',
    price: 1200,
    description: 'This MacBook Pro is in perfect condition. Only used for 3 months. Comes with original box, charger, and AppleCare+ until 2025. 16-inch, M2 Pro chip, 16GB RAM, 512GB SSD. Space Gray color.',
    images: [
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1537498425277-c283d32ef9db?q=80&w=1000&auto=format&fit=crop',
    ],
    sellerName: 'Alex Johnson',
    sellerAvatar: 'https://randomuser.me/api/portraits/men/1.jpg',
    sellerRating: 4.8,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    category: 'Electronics',
    condition: 'Like New',
    location: 'Central Campus',
  };
  
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  
  // Format relative time
  const formatRelativeTime = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };
  
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
                <img 
                  src={item.images[activeImageIndex]} 
                  alt={item.title}
                  className="w-full h-full object-cover transition-all duration-300"
                />
              </div>
              
              <div className="flex items-center gap-4 overflow-x-auto scroll-hidden">
                {item.images.map((image, index) => (
                  <button
                    key={index}
                    className={`relative rounded-lg overflow-hidden flex-shrink-0 w-20 h-20 ${
                      activeImageIndex === index ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => setActiveImageIndex(index)}
                  >
                    <img 
                      src={image} 
                      alt={`${item.title} - view ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
            
            {/* Product Details */}
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {item.category} • {formatRelativeTime(item.createdAt)}
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
                  <span className="text-xl md:text-2xl font-bold">${item.price.toFixed(2)}</span>
                </div>
              </div>
              
              <div className="glass p-4 rounded-xl">
                <div className="flex items-center gap-3">
                  <img 
                    src={item.sellerAvatar} 
                    alt={item.sellerName}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="font-medium">{item.sellerName}</h3>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <svg className="h-4 w-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span>{item.sellerRating}</span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4">
                  <Button className="w-full flex items-center justify-center">
                    <MessageCircle className="mr-2 h-5 w-5" />
                    Message Seller
                  </Button>
                </div>
              </div>
              
              <div>
                <h2 className="text-lg font-medium mb-2">Description</h2>
                <p className="text-muted-foreground">
                  {item.description}
                </p>
              </div>
              
              <div className="glass p-4 rounded-xl grid grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <h3 className="text-sm font-medium">Condition</h3>
                    <p className="text-sm text-muted-foreground">{item.condition}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <h3 className="text-sm font-medium">Posted</h3>
                    <p className="text-sm text-muted-foreground">{formatRelativeTime(item.createdAt)}</p>
                  </div>
                </div>
              </div>
              
              <div className="pt-4 border-t border-input flex gap-4">
                <Button variant="outline" className="w-1/2" onClick={() => setIsWishlisted(!isWishlisted)}>
                  <Heart className={`mr-2 h-4 w-4 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
                  {isWishlisted ? 'Saved' : 'Save'}
                </Button>
                <Button className="w-1/2">
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Chat
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
