
import React, { useState, useRef } from 'react';
import ItemCard from './ItemCard';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import Button from './Button';

const FeaturedItems: React.FC = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  
  // Sample items data (in a real app this would come from an API)
  const items = [
    {
      id: '1',
      title: 'MacBook Pro 2023 - Perfect Condition',
      price: 1200,
      image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=1000&auto=format&fit=crop',
      sellerName: 'Alex Johnson',
      sellerAvatar: 'https://randomuser.me/api/portraits/men/1.jpg',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      isFeatured: true,
      category: 'Electronics',
    },
    {
      id: '2',
      title: 'Calculus Textbook - 10th Edition',
      price: 45,
      image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=1000&auto=format&fit=crop',
      sellerName: 'Sarah Miller',
      sellerAvatar: 'https://randomuser.me/api/portraits/women/2.jpg',
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      isFeatured: false,
      category: 'Books',
    },
    {
      id: '3',
      title: 'Dorm Room Desk Chair - Ergonomic',
      price: 75,
      image: 'https://images.unsplash.com/photo-1585821569331-f071db2abd8d?q=80&w=1000&auto=format&fit=crop',
      sellerName: 'Mike Chen',
      sellerAvatar: 'https://randomuser.me/api/portraits/men/3.jpg',
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      isFeatured: false,
      category: 'Furniture',
    },
    {
      id: '4',
      title: 'Graphing Calculator - TI-84 Plus',
      price: 50,
      image: 'https://images.unsplash.com/photo-1595433542304-ef0060c2ef8a?q=80&w=1000&auto=format&fit=crop',
      sellerName: 'Samantha Lee',
      sellerAvatar: 'https://randomuser.me/api/portraits/women/4.jpg',
      createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
      isFeatured: true,
      category: 'Electronics',
    },
    {
      id: '5',
      title: 'Physics 101 Course Materials Bundle',
      price: 35,
      image: 'https://images.unsplash.com/photo-1600431521340-491eca880813?q=80&w=1000&auto=format&fit=crop',
      sellerName: 'David Wilson',
      sellerAvatar: 'https://randomuser.me/api/portraits/men/5.jpg',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      isFeatured: false,
      category: 'Books',
    },
    {
      id: '6',
      title: 'Wireless Noise-Canceling Headphones',
      price: 120,
      image: 'https://images.unsplash.com/photo-1545127398-14699f92334b?q=80&w=1000&auto=format&fit=crop',
      sellerName: 'Emma Taylor',
      sellerAvatar: 'https://randomuser.me/api/portraits/women/6.jpg',
      createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
      isFeatured: true,
      category: 'Electronics',
    },
  ];
  
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
  
  return (
    <section className="py-20 bg-secondary/50">
      <div className="container px-6 mx-auto">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-display font-bold mb-2">
              Trending Now
            </h2>
            <p className="text-muted-foreground">
              Hot items that you might not want to miss
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
            <div key={item.id} className="w-80 min-w-[320px] flex-shrink-0">
              <ItemCard {...item} />
            </div>
          ))}
        </div>
        
        <div className="flex justify-center mt-10">
          <Button 
            variant="outline" 
            className="group"
          >
            <span>View All Items</span>
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedItems;
