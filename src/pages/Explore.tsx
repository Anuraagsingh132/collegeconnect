import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ItemCard from '../components/ItemCard';
import SearchBar from '../components/SearchBar';
import { Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { databases } from '@/lib/appwrite';
import { Query } from 'appwrite';
import { APPWRITE_DATABASE_ID, APPWRITE_LISTINGS_COLLECTION_ID } from '@/lib/config';
import { useToast } from '@/components/ui/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

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
  const navigate = useNavigate();
  const { category } = useParams<{ category?: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get('q') || '';
  
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(category || 'All Categories');
  const [sortOption, setSortOption] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);
  const { toast } = useToast();
  
  useEffect(() => {
    if (category) {
      setSelectedCategory(category);
    }
  }, [category]);

  // Handle search functionality
  const handleSearch = (query: string) => {
    // Update URL search params to include the search query
    const newSearchParams = new URLSearchParams(searchParams);
    if (query) {
      newSearchParams.set('q', query);
    } else {
      newSearchParams.delete('q');
    }
    setSearchParams(newSearchParams);
  };
  
  useEffect(() => {
    const fetchListings = async () => {
      setLoading(true);
      try {
        let queries = [
          Query.equal('status', 'active')
        ];
        
        // Add category filter if not "All Categories"
        if (selectedCategory !== 'All Categories') {
          queries.push(Query.equal('category', selectedCategory));
        }
        
        const response = await databases.listDocuments(
          APPWRITE_DATABASE_ID,
          APPWRITE_LISTINGS_COLLECTION_ID,
          queries
        );
        
        // Filter results by search query if present
        let filteredResults = response.documents;
        if (searchQuery) {
          const lowercaseQuery = searchQuery.toLowerCase();
          filteredResults = filteredResults.filter((item: any) => 
            item.title?.toLowerCase().includes(lowercaseQuery) || 
            item.description?.toLowerCase().includes(lowercaseQuery) || 
            item.category?.toLowerCase().includes(lowercaseQuery)
          );
        }
        
        setItems(filteredResults);
      } catch (error: any) {
        console.error('Error fetching listings:', error);
        toast({
          title: 'Error',
          description: 'Failed to load listings: ' + (error.message || 'Unknown error'),
          variant: 'destructive',
        });
        setItems([]); // Set empty array on error
      } finally {
        setLoading(false);
      }
    };
    
    fetchListings();
  }, [selectedCategory, searchQuery, toast]);
  
  // Sort items based on selected sort option
  const sortedItems = [...items].sort((a, b) => {
    if (sortOption === 'newest') {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    } else if (sortOption === 'oldest') {
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
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
              <SearchBar 
                className="w-full md:w-auto" 
                onSearch={handleSearch}
                placeholder="Search listings..."
                initialValue={searchQuery}
              />
              
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
          
          {searchQuery && (
            <div className="mb-6">
              <p className="text-sm text-muted-foreground">
                {sortedItems.length === 0 
                  ? `No results found for "${searchQuery}"`
                  : `Showing ${sortedItems.length} result${sortedItems.length !== 1 ? 's' : ''} for "${searchQuery}"`
                }
              </p>
              <Button 
                variant="link" 
                className="p-0 h-auto text-sm" 
                onClick={() => {
                  const newParams = new URLSearchParams(searchParams);
                  newParams.delete('q');
                  setSearchParams(newParams);
                }}
              >
                Clear search
              </Button>
            </div>
          )}
          
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
              {loading ? (
                // Loading skeletons
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="rounded-xl overflow-hidden border border-border">
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
                  ))}
                </div>
              ) : sortedItems.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">
                    {searchQuery 
                      ? `No results found for "${searchQuery}". Try different keywords.`
                      : 'No items found. Try a different category or add new listings.'
                    }
                  </p>
                  {searchQuery && (
                    <Button 
                      variant="link" 
                      onClick={() => {
                        const newParams = new URLSearchParams(searchParams);
                        newParams.delete('q');
                        setSearchParams(newParams);
                      }}
                    >
                      Clear search
                    </Button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {sortedItems.map((item) => (
                    <div key={item.$id} className="animate-fade-in" style={{ '--index': sortedItems.indexOf(item) } as React.CSSProperties}>
                      <ItemCard 
                        id={item.$id}
                        title={item.title}
                        price={item.price}
                        image={item.images?.[0] || ''}
                        sellerName={item.seller_name || 'Unknown Seller'}
                        sellerAvatar={''}
                        createdAt={new Date(item.created_at)}
                        category={item.category}
                        isFeatured={item.is_featured}
                      />
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
