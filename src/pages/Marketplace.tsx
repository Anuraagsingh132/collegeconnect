import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ListingGrid from '@/components/features/listings/ListingGrid';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Search, SlidersHorizontal } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { useListings } from '@/lib/hooks/useListings';
import { useWishlist, useWishlistMutations } from '@/lib/hooks/useWishlist';

// Category options
const CATEGORIES = ['All', 'Books', 'Electronics', 'Fashion', 'Sports', 'Furniture', 'Other'];

// Sorting options
const SORT_OPTIONS = [
  { value: 'created_at.desc', label: 'Newest First' },
  { value: 'created_at.asc', label: 'Oldest First' },
  { value: 'price.asc', label: 'Price: Low to High' },
  { value: 'price.desc', label: 'Price: High to Low' },
];

// Define Listing type
interface Listing {
  id: string;
  title: string;
  price: number;
  created_at: string;
  seller: string;
}

export default function Marketplace() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'All');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'created_at.desc');

  // Fetch listings using custom hook
  const { data: listingsData = [], isLoading, error } = useListings({
    category: selectedCategory === 'All' ? undefined : selectedCategory,
    searchQuery,
    sortBy,
  });

  // Ensure listings have necessary properties
  const listings: Listing[] = listingsData.map((data) => ({
    ...data,
    created_at: data.created_at || new Date().toISOString(), // Ensure valid timestamp
    seller: data.seller || 'Unknown', // Default value
  }));

  // Fetch wishlisted items & ensure it's a Set<string>
  const { data: wishlistedItemsRaw = [] } = useWishlist();
  const wishlistedItems = new Set<string>(wishlistedItemsRaw as string[]);

  // Wishlist mutations
  const { addToWishlist, removeFromWishlist } = useWishlistMutations();

  // Update URL params when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (selectedCategory !== 'All') params.set('category', selectedCategory);
    if (sortBy !== 'created_at.desc') params.set('sort', sortBy);
    setSearchParams(params);
  }, [searchQuery, selectedCategory, sortBy, setSearchParams]);

  // Handle search form submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    setSearchQuery(formData.get('search') as string);
  };

  // Handle wishlist toggling
  const handleWishlistToggle = (listingId: string) => {
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'Please sign in to add items to your wishlist.',
        variant: 'default',
      });
      return;
    }

    if (wishlistedItems.has(listingId)) {
      removeFromWishlist.mutate(listingId);
    } else {
      addToWishlist.mutate(listingId);
    }
  };

  // Show error if listings fetch failed
  useEffect(() => {
    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch listings. Please try again.',
        variant: 'destructive',
      });
    }
  }, [error, toast]);

  return (
    <div className="container py-8 space-y-6">
      {/* Search and Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <form onSubmit={handleSearch} className="flex-1 sm:max-w-md">
          <div className="relative">
            <Input
              name="search"
              placeholder="Search listings..."
              defaultValue={searchQuery}
              className="pr-10"
            />
            <Button
              type="submit"
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-full px-3 text-muted-foreground hover:text-foreground"
            >
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </form>

        <div className="flex items-center gap-2">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]">
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Listings Grid */}
      <ListingGrid
        listings={listings}
        isLoading={isLoading}
        onWishlistToggle={handleWishlistToggle}
        wishlistedItems={wishlistedItems}
      />
    </div>
  );
}
