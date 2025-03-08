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
import { databases } from '@/lib/appwrite';
import { Query } from 'appwrite';
import { 
    APPWRITE_DATABASE_ID,
    APPWRITE_LISTINGS_COLLECTION_ID 
} from '@/lib/config';

const CATEGORIES = [
  'All',
  'Books',
  'Electronics',
  'Fashion',
  'Sports',
  'Furniture',
  'Other',
];

const SORT_OPTIONS = [
  { value: 'created_at.desc', label: 'Newest First' },
  { value: 'created_at.asc', label: 'Oldest First' },
  { value: 'price.asc', label: 'Price: Low to High' },
  { value: 'price.desc', label: 'Price: High to Low' },
];

export default function Marketplace() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [listings, setListings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [wishlistedItems, setWishlistedItems] = useState(new Set<string>());

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'All');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'created_at.desc');

  // Fetch listings with search and filters
  useEffect(() => {
    const fetchListings = async () => {
      setIsLoading(true);
      try {
        const response = await databases.listDocuments(
          APPWRITE_DATABASE_ID,
          APPWRITE_LISTINGS_COLLECTION_ID,
          [
            // Add any filters here
            // Example: Query.equal('status', 'active')
          ]
        );
        setListings(response.documents);
      } catch (error) {
        console.error('Error fetching listings:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch listings. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchListings();
  }, [toast]);

  // Fetch wishlisted items
  useEffect(() => {
    const fetchWishlistedItems = async () => {
      if (!user) return;

      try {
        const response = await databases.listDocuments(
          APPWRITE_DATABASE_ID,
          APPWRITE_LISTINGS_COLLECTION_ID,
          [
            Query.equal('favorite', true),
            Query.equal('user_id', user.$id)
          ]
        );
        
        const wishlistedIds = new Set<string>(response.documents.map(doc => doc.$id));
        setWishlistedItems(wishlistedIds);
      } catch (error) {
        console.error('Error fetching wishlisted items:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch wishlisted items',
          variant: 'destructive',
        });
      }
    };

    fetchWishlistedItems();
  }, [user, toast]);

  // Update URL params when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (selectedCategory !== 'All') params.set('category', selectedCategory);
    if (sortBy !== 'created_at.desc') params.set('sort', sortBy);
    setSearchParams(params);
  }, [searchQuery, selectedCategory, sortBy, setSearchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    setSearchQuery(formData.get('search') as string);
  };

  const handleWishlistToggle = (listingId: string) => {
    setWishlistedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(listingId)) {
        newSet.delete(listingId);
      } else {
        newSet.add(listingId);
      }
      return newSet;
    });
  };

  const deleteListing = async (listingId: string) => {
    try {
      await databases.deleteDocument(
        APPWRITE_DATABASE_ID,
        APPWRITE_LISTINGS_COLLECTION_ID,
        listingId
      );
      // Refresh listings after deletion
      fetchListings();
      toast({
        title: 'Success',
        description: 'Listing deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting listing:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete listing',
        variant: 'destructive',
      });
    }
  };

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
