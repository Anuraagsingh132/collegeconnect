import React, { useState, useRef, useEffect } from 'react';
import ItemCard from './ItemCard';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import { databases } from '@/lib/appwrite';
import { Query } from 'appwrite';
import { APPWRITE_DATABASE_ID, APPWRITE_LISTINGS_COLLECTION_ID } from '@/lib/config';

const FeaturedItems: React.FC = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Fetch the most expensive items
  useEffect(() => {
    const fetchExpensiveItems = async () => {
      setLoading(true);
      try {
        // Get active listings ordered by price (highest first)
        const response = await databases.listDocuments(
          APPWRITE_DATABASE_ID,
          APPWRITE_LISTINGS_COLLECTION_ID,
          [
            Query.equal('status', 'active'),
            Query.orderDesc('price'),
            Query.limit(10)
          ]
        );
        
        setItems(response.documents);
      } catch (error) {
        console.error('Error fetching trending items:', error);
        setItems([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchExpensiveItems();
  }, []);
  
  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    
    const { current } = scrollRef;
    const scrollAmount = 400; // Adjust as needed
    
    if (direction === 'left') {
      current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    } else {
      current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
    
    // Check scroll position after animation
    setTimeout(() => {
      if (!scrollRef.current) return;
      
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10); // 10px buffer
    }, 300);
  };
  
  // Render loading skeletons
  if (loading) {
    return (
      <section className="py-20 bg-secondary/50">
        <div className="container px-6 mx-auto">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-display font-bold mb-2">
                Trending Now
              </h2>
              <p className="text-muted-foreground">
                Most expensive items you might be interested in
              </p>
            </div>
          </div>
          
          <div className="flex space-x-6 overflow-x-auto scroll-hidden pb-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="w-80 min-w-[320px] flex-shrink-0">
                <div className="rounded-xl overflow-hidden border border-border h-full">
                  <Skeleton className="h-48 w-full" />
                  <div className="p-4 space-y-2">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/4" />
                    <div className="flex items-center space-x-2 pt-2">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <Skeleton className="h-4 w-1/3" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }
  
  // If no items, don't render the section
  if (items.length === 0) {
    return null;
  }
  
  return (
    <section className="py-20 bg-secondary/50">
      <div className="container px-6 mx-auto">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-display font-bold mb-2">
              Trending Now
            </h2>
            <p className="text-muted-foreground">
              Most expensive items you might be interested in
            </p>
          </div>
          
          <div className="hidden sm:flex items-center gap-2">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => scroll('left')}
              disabled={!canScrollLeft}
              className="opacity-70 hover:opacity-100 disabled:opacity-30"
              aria-label="Scroll left"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => scroll('right')}
              disabled={!canScrollRight}
              className="opacity-70 hover:opacity-100 disabled:opacity-30"
              aria-label="Scroll right"
            >
              <ArrowRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
        
        <div 
          ref={scrollRef}
          className="flex space-x-6 overflow-x-auto scroll-hidden pb-4"
          onScroll={() => {
            if (!scrollRef.current) return;
            const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
            setCanScrollLeft(scrollLeft > 0);
            setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
          }}
        >
          {items.map((item) => (
            <div key={item.$id} className="w-80 min-w-[320px] flex-shrink-0">
              <ItemCard 
                id={item.$id}
                title={item.title}
                price={item.price}
                image={item.images?.[0] || ''}
                sellerName={item.seller_name || 'Unknown Seller'}
                sellerAvatar={''}
                createdAt={new Date(item.created_at)}
                category={item.category}
                isFeatured={true}
              />
            </div>
          ))}
        </div>
        
        <div className="flex justify-center mt-10">
          <Button 
            variant="outline" 
            className="group"
            asChild
          >
            <Link to="/explore">
              <span>View All Items</span>
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedItems;
