
import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import ItemCard from '../components/ItemCard';
import SearchBar from '../components/SearchBar';
import { Filter } from 'lucide-react';
import Button from '../components/Button';

// Sample data (in a real app, this would come from an API)
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
  {
    id: '7',
    title: 'Modern Coffee Table - Great for Apartments',
    price: 65,
    image: 'https://images.unsplash.com/photo-1592078615290-033ee584e267?q=80&w=1000&auto=format&fit=crop',
    sellerName: 'Jack Brown',
    sellerAvatar: 'https://randomuser.me/api/portraits/men/7.jpg',
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
    isFeatured: false,
    category: 'Furniture',
  },
  {
    id: '8',
    title: 'Organic Chemistry Study Notes - Complete',
    price: 30,
    image: 'https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?q=80&w=1000&auto=format&fit=crop',
    sellerName: 'Olivia Martinez',
    sellerAvatar: 'https://randomuser.me/api/portraits/women/8.jpg',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    isFeatured: false,
    category: 'Books',
  },
];

const categories = [
  'All Categories',
  'Books',
  'Electronics',
  'Furniture',
  'Clothing',
  'Food',
  'Housing',
  'Music',
  'Transport',
  'Services',
];

const Explore: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [sortOption, setSortOption] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);
  
  // Filter items based on selected category
  const filteredItems = selectedCategory === 'All Categories'
    ? items
    : items.filter(item => item.category === selectedCategory);
  
  // Sort items based on selected sort option
  const sortedItems = [...filteredItems].sort((a, b) => {
    if (sortOption === 'newest') {
      return b.createdAt.getTime() - a.createdAt.getTime();
    } else if (sortOption === 'oldest') {
      return a.createdAt.getTime() - b.createdAt.getTime();
    } else if (sortOption === 'price-low') {
      return a.price - b.price;
    } else if (sortOption === 'price-high') {
      return b.price - a.price;
    }
    return 0;
  });
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-28 pb-20">
        <div className="container px-6 mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <h1 className="text-3xl font-display font-bold">Explore Listings</h1>
            
            <div className="flex items-center gap-2">
              <SearchBar className="w-full md:w-auto" />
              
              <Button 
                variant="outline" 
                size="icon" 
                onClick={() => setShowFilters(!showFilters)}
                className="md:hidden"
                aria-label={showFilters ? "Hide filters" : "Show filters"}
              >
                <Filter className="h-5 w-5" />
              </Button>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row gap-6">
            {/* Filters (always visible on desktop, toggle on mobile) */}
            <div className={`md:w-64 shrink-0 ${showFilters ? 'block' : 'hidden md:block'}`}>
              <div className="glass p-4 rounded-xl">
                <h2 className="text-base font-medium mb-4">Categories</h2>
                <ul className="space-y-2">
                  {categories.map(category => (
                    <li key={category}>
                      <button
                        onClick={() => setSelectedCategory(category)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                          selectedCategory === category 
                            ? 'bg-primary/10 text-primary font-medium' 
                            : 'hover:bg-secondary'
                        }`}
                      >
                        {category}
                      </button>
                    </li>
                  ))}
                </ul>
                
                <div className="border-t border-input my-4"></div>
                
                <h2 className="text-base font-medium mb-4">Sort By</h2>
                <div className="space-y-2">
                  {[
                    { value: 'newest', label: 'Newest First' },
                    { value: 'oldest', label: 'Oldest First' },
                    { value: 'price-low', label: 'Price: Low to High' },
                    { value: 'price-high', label: 'Price: High to Low' },
                  ].map(option => (
                    <button
                      key={option.value}
                      onClick={() => setSortOption(option.value)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        sortOption === option.value 
                          ? 'bg-primary/10 text-primary font-medium' 
                          : 'hover:bg-secondary'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
                
                <div className="border-t border-input my-4 md:hidden"></div>
                
                <Button className="w-full md:hidden" onClick={() => setShowFilters(false)}>
                  Apply Filters
                </Button>
              </div>
            </div>
            
            {/* Items Grid */}
            <div className="flex-1">
              {sortedItems.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No items found. Try a different category.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {sortedItems.map((item) => (
                    <div key={item.id} className="animate-fade-in" style={{ '--index': sortedItems.indexOf(item) } as React.CSSProperties}>
                      <ItemCard {...item} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Explore;
